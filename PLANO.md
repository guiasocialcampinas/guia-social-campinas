# Guia de projetos sociais de Campinas e região

Plano do projeto. Atualizado em 21/11/2026.

## Objetivo

Um site que funcione como banco de dados de projetos sociais de Campinas e da Região
Metropolitana de Campinas (RMC). É um guia para quem quer colaborar (com dinheiro,
voluntariado ou de outra forma), mas não sabe como nem quais projetos existem.

## Decisões já tomadas

- **Região:** Região Metropolitana de Campinas, não só o município.
- **Cada projeto tem:** nome, descrição curta, área(s), público(s), cidade/bairro,
  contato institucional (site, e-mail, telefone, redes), fonte da informação e data da
  última verificação.
- **Dados:** o Claude pesquisa na internet, em fontes públicas (prefeituras, conselhos
  municipais da criança e do adolescente, do idoso e da assistência social, mapas
  oficiais de organizações da sociedade civil, sites e redes das próprias entidades),
  confere e atualiza. O usuário revisa o piloto.
- **Formato:** começar leve. Site estático que funciona bem no celular, com busca por
  texto e filtros por área, público e cidade. Dados num arquivo simples (JSON),
  mantido pelo Claude. Hospedagem gratuita (GitHub Pages ou Cloudflare Pages).
  Aplicativo de loja só depois, se fizer sentido.
- **Escopo inicial:** o site só mostra o contato dos projetos. Intermediar voluntariado
  ou doações fica fora, por ora.
- **Custo:** perto de zero. Domínio próprio é opcional (cerca de R$ 40 por ano).
  O usuário trabalha sozinho.
- **Privacidade (LGPD):** publicar só contatos institucionais. Nunca telefone ou e-mail
  pessoal de pessoa física.
- **Avisos no site:** as informações são públicas e podem estar desatualizadas; cada
  projeto mostra a data da última verificação; botão "reportar erro ou cadastrar
  projeto" (formulário gratuito). O Claude só confere pela internet: não liga nem
  visita.

## Fases

| Fase | O que é | Situação |
|---|---|---|
| 0 | Definições: áreas, públicos, critério de inclusão, municípios da RMC, modelo do registro | Aprovada em 21/11/2026 (`FASE0-definicoes.md`) |
| 1 | Protótipo do site | Pronto em 21/11/2026, com 6 projetos fictícios; falta o link do formulário |
| 2 | Coleta piloto de cerca de 30 projetos, com revisão do usuário | 24 projetos gravados em 21/11/2026 (ver `PILOTO-notas.md`); aguardando revisão do usuário |
| 3 | Escala e rotina de verificação (talvez uma tarefa agendada periódica) | A fazer |
| 4 | Publicação | A fazer |
| 5 | Evolução (aplicativo, intermediação etc.) | Fora do escopo por ora |

## Como o site está montado

- `index.html`, `estilo.css` e `app.js`: a página, com busca e filtros.
- `dados/projetos.json`: os projetos. `dados/listas.json`: as listas oficiais da Fase 0.
- `ferramentas/validar.py`: confere os dados (campos obrigatórios, listas, datas,
  contatos). O Claude roda depois de cada atualização.
- No topo de `app.js`, `LINK_FORMULARIO` recebe o endereço do formulário
  "reportar erro ou cadastrar projeto" quando ele existir.
