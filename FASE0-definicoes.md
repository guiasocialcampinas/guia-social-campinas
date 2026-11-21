# Fase 0: definições

Situação: **aprovada pelo usuário em 21/11/2026**, sem ajustes. É a referência para o
site e para a coleta. As listas oficiais usadas pelo site ficam em `dados/listas.json`.

## 1. Municípios (Região Metropolitana de Campinas, 20 municípios)

Americana, Artur Nogueira, Campinas, Cosmópolis, Engenheiro Coelho, Holambra,
Hortolândia, Indaiatuba, Itatiba, Jaguariúna, Monte Mor, Morungaba, Nova Odessa,
Paulínia, Pedreira, Santa Bárbara d'Oeste, Santo Antônio de Posse, Sumaré, Valinhos,
Vinhedo.

Projeto que atende vários municípios: marca todos os que atende (ou "Toda a RMC").
Em Campinas, o bairro é opcional e ajuda o filtro.

## 2. Áreas de atuação (um projeto pode ter várias)

1. Assistência social
2. Educação
3. Cultura
4. Esporte e lazer
5. Saúde
6. Alimentação (combate à fome)
7. Moradia
8. Trabalho e renda
9. Direitos humanos e cidadania
10. Participação política e controle social (apartidário)
11. Meio ambiente
12. Proteção animal
13. Inclusão digital

## 3. Públicos (um projeto pode ter vários)

1. Crianças
2. Adolescentes e jovens
3. Idosos
4. Mulheres
5. Pessoas em situação de rua
6. Pessoas com deficiência
7. Famílias em vulnerabilidade
8. Pessoas com doenças graves e seus familiares
9. Pessoas com dependência química
10. Pessoas LGBTQIA+
11. População negra
12. Povos indígenas
13. Migrantes e refugiados
14. Egressos do sistema prisional
15. Comunidade em geral
16. Animais

## 4. Critério de inclusão

Entra no guia o projeto que cumpre **todos** os itens:

- não tem fins lucrativos (associação, fundação, instituto, cooperativa social ou
  coletivo sem CNPJ com atuação pública);
- atua em pelo menos um município da RMC;
- mostra sinal público de atividade nos últimos 12 meses (post, notícia, site
  atualizado, registro em conselho municipal);
- tem ao menos um canal de contato institucional.

Prioridade na coleta (pedido do usuário em 21/11/2026):

- projetos **consolidados** primeiro (anos de atuação, CNPJ, site próprio, presença
  regular nas redes ou em conselhos municipais);
- de preferência **sem conotação religiosa** (nome, missão e atividades laicos);
- incluir **cozinhas solidárias**.

Fica de fora:

- órgãos e serviços públicos (CRAS, CAPS, escolas públicas), por ora;
- empresas e ações de marketing de empresas;
- partidos, candidaturas e campanhas eleitorais;
- igreja ou templo cuja atividade seja só religiosa (a obra social de entidade
  religiosa entra, se atender a todos sem exigir participação religiosa);
- vaquinhas e pedidos de ajuda de pessoas físicas.

## 5. Modelo do registro (arquivo `dados/projetos.json`)

| Campo | Obrigatório | Exemplo / regra |
|---|---|---|
| id | sim | `casa-exemplo-campinas` (gerado pelo Claude) |
| nome | sim | Casa Exemplo |
| descricao | sim | até 300 caracteres, linguagem simples |
| areas | sim | lista, da tabela do item 2 |
| publicos | sim | lista, da tabela do item 3 |
| cidades | sim | lista, da tabela do item 1 |
| bairro | não | Jardim Exemplo |
| formas_de_colaborar | não | doação em dinheiro, doação de itens, voluntariado, divulgação |
| site, email, telefone, instagram, facebook, whatsapp | ao menos um | só institucional |
| fonte | sim | endereço (URL) de onde veio a informação |
| verificado_em | sim | data da última conferência (dd/mm/aaaa no site) |
| situacao | sim | "verificado" ou "a verificar" |

O campo **formas_de_colaborar** é sugestão nova: não estava na lista combinada. Só
registra o que a própria entidade divulga (o site não intermedeia nada). Ajuda quem
chega ao guia querendo saber "como posso ajudar?".
