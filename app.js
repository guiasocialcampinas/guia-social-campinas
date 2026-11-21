// Guia Social Campinas: busca e filtros dos projetos.
// Os dados ficam em dados/projetos.json e as listas oficiais em dados/listas.json.

// Endereço do serviço que recebe as mensagens da caixa "Fale com a gente" e as envia
// por e-mail ao responsável (ex.: "https://formspree.io/f/xxxxxxx").
// Enquanto estiver vazio, a caixa avisa que ainda está sendo configurada e não envia nada.
const ENDERECO_MENSAGENS = "";

// Verificação mais antiga que isso ganha destaque de "conferência antiga".
const MESES_VERIFICACAO_ANTIGA = 6;

const estado = { projetos: [], listas: null };

const el = {
  busca: document.getElementById("busca"),
  area: document.getElementById("f-area"),
  publico: document.getElementById("f-publico"),
  cidade: document.getElementById("f-cidade"),
  colaborar: document.getElementById("f-colaborar"),
  contagem: document.getElementById("contagem"),
  limpar: document.getElementById("limpar"),
  lista: document.getElementById("lista"),
  modelo: document.getElementById("modelo-cartao"),
};

// Tira acentos e deixa em minúsculas, para a busca achar "educacao" e "Educação".
function normalizar(texto) {
  return (texto || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function dataBR(iso) {
  const [a, m, d] = (iso || "").split("-");
  return a && m && d ? `${d}/${m}/${a}` : "-";
}

function mesesDesde(iso) {
  const data = new Date(iso + "T12:00:00");
  if (isNaN(data)) return Infinity;
  const hoje = new Date();
  return (hoje.getFullYear() - data.getFullYear()) * 12 + (hoje.getMonth() - data.getMonth());
}

// Preenche um filtro só com as opções que aparecem nos dados, na ordem da lista oficial.
function preencherFiltro(select, ordemOficial, campo) {
  const usados = new Set(estado.projetos.flatMap((p) => p[campo] || []));
  for (const valor of ordemOficial) {
    if (!usados.has(valor)) continue;
    const opcao = document.createElement("option");
    opcao.value = valor;
    opcao.textContent = valor;
    select.appendChild(opcao);
  }
}

function filtrosAtuais() {
  return {
    texto: normalizar(el.busca.value.trim()),
    area: el.area.value,
    publico: el.publico.value,
    cidade: el.cidade.value,
    colaborar: el.colaborar.value,
  };
}

function combina(projeto, f) {
  if (f.area && !projeto.areas.includes(f.area)) return false;
  if (f.publico && !projeto.publicos.includes(f.publico)) return false;
  if (f.cidade && !projeto.cidades.includes(f.cidade)) return false;
  if (f.colaborar && !(projeto.formas_de_colaborar || []).includes(f.colaborar)) return false;
  if (f.texto) {
    const alvo = normalizar([
      projeto.nome, projeto.descricao, projeto.bairro,
      ...projeto.areas, ...projeto.publicos, ...projeto.cidades,
    ].join(" "));
    // Todas as palavras digitadas precisam aparecer, em qualquer ordem.
    if (!f.texto.split(/\s+/).every((palavra) => alvo.includes(palavra))) return false;
  }
  return true;
}

function linkContato(rotulo, href) {
  const a = document.createElement("a");
  a.textContent = rotulo;
  a.href = href;
  if (href.startsWith("http")) {
    a.target = "_blank";
    a.rel = "noopener";
  }
  return a;
}

// Iniciais das duas primeiras palavras importantes do nome ("Fundo Haja!" vira "FH").
function iniciais(nome) {
  const ignorar = new Set(["de", "da", "do", "das", "dos", "e", "a", "o"]);
  const palavras = nome.replace(/\(.*?\)/g, " ").split(/[\s\-–]+/)
    .map((w) => w.replace(/[^\p{L}\p{N}]/gu, ""))
    .filter((w) => w && !ignorar.has(w.toLowerCase()));
  return palavras.slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}

// Cor estável para cada projeto (a mesma a cada visita), escura o bastante para o texto branco.
function corDoProjeto(id) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) % 360;
  return `hsl(${h} 45% 38%)`;
}

function mostrarIniciais(marca, p) {
  marca.replaceChildren();
  marca.className = "marca iniciais";
  marca.style.background = corDoProjeto(p.id);
  marca.textContent = iniciais(p.nome);
}

function montarMarca(marca, p) {
  if (!p.logo) {
    mostrarIniciais(marca, p);
    return;
  }
  marca.className = "marca com-logo";
  const img = document.createElement("img");
  img.src = p.logo;
  img.alt = "";
  img.loading = "lazy";
  img.width = 48;
  img.height = 48;
  img.addEventListener("error", () => mostrarIniciais(marca, p));
  marca.appendChild(img);
}

function montarCartao(p) {
  const no = el.modelo.content.firstElementChild.cloneNode(true);
  montarMarca(no.querySelector(".marca"), p);
  no.querySelector(".nome").textContent = p.nome;
  const cidades = p.cidades.join(", ");
  no.querySelector(".local").textContent = p.bairro ? `${p.bairro} · ${cidades}` : cidades;
  no.querySelector(".descricao").textContent = p.descricao;

  const areas = no.querySelector(".areas");
  for (const area of p.areas) {
    const span = document.createElement("span");
    span.className = "etiqueta";
    span.textContent = area;
    areas.appendChild(span);
  }

  no.querySelector(".publicos").textContent = p.publicos.join(", ");

  const formas = p.formas_de_colaborar || [];
  if (formas.length) no.querySelector(".colaborar").textContent = formas.join(", ");
  else no.querySelector(".linha-colaborar").remove();

  const contatos = no.querySelector(".contatos");
  if (p.site) contatos.appendChild(linkContato("Site", p.site));
  if (p.instagram) contatos.appendChild(linkContato("Instagram", p.instagram));
  if (p.facebook) contatos.appendChild(linkContato("Facebook", p.facebook));
  if (p.whatsapp) contatos.appendChild(linkContato("WhatsApp", `https://wa.me/55${p.whatsapp}`));
  if (p.telefone) contatos.appendChild(linkContato("Ligar", `tel:+55${p.telefone}`));
  if (p.email) contatos.appendChild(linkContato("E-mail", `mailto:${p.email}`));

  const verificacao = no.querySelector(".verificacao");
  const antigo = mesesDesde(p.verificado_em) >= MESES_VERIFICACAO_ANTIGA;
  const textoData = document.createElement("span");
  textoData.textContent = `Conferido em ${dataBR(p.verificado_em)}`;
  if (antigo) {
    textoData.className = "antigo";
    textoData.textContent += " (conferência antiga, confirme com a entidade)";
  }
  verificacao.appendChild(textoData);
  if (p.situacao === "a verificar") {
    const pendente = document.createElement("span");
    pendente.className = "antigo";
    pendente.textContent = " · atividade recente não confirmada";
    verificacao.appendChild(pendente);
  }
  if (p.fonte) {
    verificacao.appendChild(document.createTextNode(" · "));
    const fonte = linkContato("fonte", p.fonte);
    verificacao.appendChild(fonte);
  }
  verificacao.appendChild(document.createTextNode(" · "));
  const corrigir = document.createElement("button");
  corrigir.type = "button";
  corrigir.className = "botao-link";
  corrigir.textContent = "informação errada?";
  corrigir.addEventListener("click", () => abrirContato("Corrigir uma informação", `Projeto: ${p.nome}\n\n`));
  verificacao.appendChild(corrigir);
  return no;
}

function atualizar() {
  const f = filtrosAtuais();
  const encontrados = estado.projetos.filter((p) => combina(p, f));

  el.lista.replaceChildren();
  if (encontrados.length === 0) {
    const vazio = document.createElement("p");
    vazio.className = "vazio";
    vazio.textContent = "Nenhum projeto encontrado. Tente tirar algum filtro ou buscar outra palavra.";
    el.lista.appendChild(vazio);
  } else {
    for (const p of encontrados) el.lista.appendChild(montarCartao(p));
  }

  const total = estado.projetos.length;
  el.contagem.textContent = encontrados.length === total
    ? `${total} projetos`
    : `${encontrados.length} de ${total} projetos`;

  const algumFiltro = f.texto || f.area || f.publico || f.cidade || f.colaborar;
  el.limpar.hidden = !algumFiltro;
  salvarNoEndereco(f);
}

// Guarda os filtros no endereço da página, para dar para compartilhar uma busca pronta.
function salvarNoEndereco(f) {
  const params = new URLSearchParams();
  if (el.busca.value.trim()) params.set("q", el.busca.value.trim());
  if (f.area) params.set("area", f.area);
  if (f.publico) params.set("publico", f.publico);
  if (f.cidade) params.set("cidade", f.cidade);
  if (f.colaborar) params.set("ajuda", f.colaborar);
  const qs = params.toString();
  history.replaceState(null, "", qs ? `?${qs}` : location.pathname);
}

function lerDoEndereco() {
  const params = new URLSearchParams(location.search);
  el.busca.value = params.get("q") || "";
  const definir = (select, valor) => {
    if (valor && [...select.options].some((o) => o.value === valor)) select.value = valor;
  };
  definir(el.area, params.get("area"));
  definir(el.publico, params.get("publico"));
  definir(el.cidade, params.get("cidade"));
  definir(el.colaborar, params.get("ajuda"));
}

// Leva o visitante à caixa de mensagens já com o assunto (e, se houver, o texto inicial).
function abrirContato(assunto, textoInicial) {
  document.getElementById("c-assunto").value = assunto;
  const mensagem = document.getElementById("c-mensagem");
  if (textoInicial && !mensagem.value.trim()) mensagem.value = textoInicial;
  document.getElementById("contato").scrollIntoView({ behavior: "smooth", block: "start" });
  mensagem.focus({ preventScroll: true });
  mensagem.setSelectionRange(mensagem.value.length, mensagem.value.length);
}

function configurarContato() {
  const form = document.getElementById("form-contato");
  const status = document.getElementById("c-status");
  const botao = document.getElementById("c-enviar");
  const avisar = (texto, tipo) => {
    status.textContent = texto;
    status.className = `status ${tipo || ""}`;
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const mensagem = form.mensagem.value.trim();
    const email = form.email.value.trim();
    if (!mensagem) {
      avisar("Escreva sua mensagem antes de enviar.", "erro");
      form.mensagem.focus();
      return;
    }
    if (email && !form.email.checkValidity()) {
      avisar("O e-mail parece incompleto. Confira ou deixe em branco.", "erro");
      form.email.focus();
      return;
    }
    if (!ENDERECO_MENSAGENS) {
      avisar("A caixa de mensagens ainda está sendo configurada. Sua mensagem não foi enviada.", "erro");
      return;
    }
    botao.disabled = true;
    avisar("Enviando...");
    try {
      const resposta = await fetch(ENDERECO_MENSAGENS, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
      form.reset();
      avisar("Mensagem enviada. Obrigado pelo contato!", "ok");
    } catch (erro) {
      console.error(erro);
      avisar("Não foi possível enviar agora. Tente de novo em alguns minutos.", "erro");
    } finally {
      botao.disabled = false;
    }
  });
}

async function iniciar() {
  configurarContato();
  try {
    const [respProjetos, respListas] = await Promise.all([
      fetch("dados/projetos.json", { cache: "no-cache" }),
      fetch("dados/listas.json", { cache: "no-cache" }),
    ]);
    const dados = await respProjetos.json();
    estado.listas = await respListas.json();
    estado.projetos = [...dados.projetos].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

    document.getElementById("aviso-exemplo").hidden = !dados.exemplo;
    document.getElementById("data-atualizacao").textContent = dataBR(dados.atualizado_em);

    preencherFiltro(el.area, estado.listas.areas, "areas");
    preencherFiltro(el.publico, estado.listas.publicos, "publicos");
    preencherFiltro(el.cidade, estado.listas.cidades, "cidades");
    preencherFiltro(el.colaborar, estado.listas.formas_de_colaborar, "formas_de_colaborar");
    lerDoEndereco();
    atualizar();
  } catch (erro) {
    el.lista.innerHTML = '<p class="vazio">Não foi possível carregar os projetos. Tente recarregar a página.</p>';
    console.error(erro);
  }
}

el.busca.addEventListener("input", atualizar);
for (const s of [el.area, el.publico, el.cidade, el.colaborar]) s.addEventListener("change", atualizar);
el.limpar.addEventListener("click", () => {
  el.busca.value = "";
  for (const s of [el.area, el.publico, el.cidade, el.colaborar]) s.value = "";
  atualizar();
  el.busca.focus();
});

iniciar();
