# -*- coding: utf-8 -*-
"""Confere dados/projetos.json contra as regras da Fase 0.

Uso: python ferramentas/validar.py
Sai com código 0 se estiver tudo certo e 1 se houver erro.
"""
import json
import re
import sys
from datetime import date
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

RAIZ = Path(__file__).resolve().parent.parent
LISTAS = json.loads((RAIZ / "dados" / "listas.json").read_text(encoding="utf-8"))
DADOS = json.loads((RAIZ / "dados" / "projetos.json").read_text(encoding="utf-8"))

OBRIGATORIOS = ["id", "nome", "descricao", "areas", "publicos", "cidades", "fonte", "verificado_em", "situacao"]
CONTATOS = ["site", "email", "telefone", "instagram", "facebook", "whatsapp"]
CAMPOS_CONHECIDOS = set(OBRIGATORIOS + CONTATOS + ["bairro", "formas_de_colaborar"])
LISTA_DO_CAMPO = {
    "areas": "areas",
    "publicos": "publicos",
    "cidades": "cidades",
    "formas_de_colaborar": "formas_de_colaborar",
}
SITUACOES = {"verificado", "a verificar"}
# E-mail com cara de pessoal: provedor gratuito. Não é proibido (muita entidade pequena usa),
# mas vale uma conferência manual de que é o e-mail da entidade, não de uma pessoa.
PROVEDORES_GRATUITOS = ("gmail.com", "hotmail.com", "outlook.com", "yahoo.com", "yahoo.com.br", "uol.com.br", "bol.com.br")

erros, avisos = [], []
ids = set()

for i, p in enumerate(DADOS.get("projetos", []), start=1):
    nome = p.get("nome") or f"projeto nº {i}"
    for campo in OBRIGATORIOS:
        if not p.get(campo):
            erros.append(f"{nome}: falta o campo obrigatório '{campo}'")
    for campo in p:
        if campo not in CAMPOS_CONHECIDOS:
            erros.append(f"{nome}: campo desconhecido '{campo}'")
    if p.get("id") in ids:
        erros.append(f"{nome}: id repetido '{p.get('id')}'")
    ids.add(p.get("id"))
    if not any(p.get(c) for c in CONTATOS):
        erros.append(f"{nome}: precisa de pelo menos um contato institucional")
    if len(p.get("descricao", "")) > 300:
        erros.append(f"{nome}: descrição passa de 300 caracteres")
    for campo, lista in LISTA_DO_CAMPO.items():
        for valor in p.get(campo, []):
            if valor not in LISTAS[lista]:
                erros.append(f"{nome}: '{valor}' não está na lista oficial de {lista}")
    if p.get("situacao") not in SITUACOES:
        erros.append(f"{nome}: situação deve ser 'verificado' ou 'a verificar'")
    try:
        verificado = date.fromisoformat(p.get("verificado_em", ""))
        if verificado > date.today():
            erros.append(f"{nome}: data de verificação no futuro")
        elif (date.today() - verificado).days > 180:
            avisos.append(f"{nome}: conferido há mais de 6 meses ({verificado:%d/%m/%Y})")
    except ValueError:
        erros.append(f"{nome}: verificado_em deve estar no formato aaaa-mm-dd")
    for campo in ("telefone", "whatsapp"):
        if p.get(campo) and not re.fullmatch(r"\d{10,11}", p[campo]):
            erros.append(f"{nome}: {campo} deve ter só os dígitos com DDD (10 ou 11 dígitos)")
    for campo in ("site", "instagram", "facebook", "fonte"):
        if p.get(campo) and not p[campo].startswith("https://"):
            avisos.append(f"{nome}: {campo} não começa com https://")
    email = p.get("email", "")
    if email and email.lower().endswith(PROVEDORES_GRATUITOS):
        avisos.append(f"{nome}: e-mail em provedor gratuito ({email}); confirme que é da entidade, não de uma pessoa")

total = len(DADOS.get("projetos", []))
print(f"Projetos conferidos: {total}")
for a in avisos:
    print(f"  AVISO: {a}")
for e in erros:
    print(f"  ERRO: {e}")
print("Resultado: " + ("OK" if not erros else f"{len(erros)} erro(s)"))
sys.exit(1 if erros else 0)
