
console.log("========== PARTE 1 – Pedidos ==========");

const pedidos = [
  { id: 1, cliente: "Bia", valor: 120, status: "pago" },
  { id: 2, cliente: "Sarah", valor: 75.5, status: "pendente" },
  { id: 3, cliente: "", valor: 50, status: "pago" },          
  { id: 4, cliente: "Benoni", valor: -30, status: "pago" },     
  { id: 5, cliente: "Sophia", valor: "200", status: "pago" },   
  { id: 6, cliente: "Maria", valor: 89.9, status: "pago" },
  { id: 7, cliente: "   ", valor: 40, status: "pago" },       
  { id: 8, cliente: "Ana Julia", valor: 310.25, status: "pago" },
  { id: 9, cliente: "Vinicius", valor: 60, status: "cancelado" },
];


const ehPedidoValido = (pedido) =>
  typeof pedido.cliente === "string" &&
  pedido.cliente.trim() !== "" &&
  typeof pedido.valor === "number" &&
  Number.isFinite(pedido.valor) &&
  pedido.valor > 0;

const pedidosValidos = pedidos.filter(ehPedidoValido);
const pedidosInvalidos = pedidos.filter((pedido) => !ehPedidoValido(pedido));
console.log("Pedidos válidos:", pedidosValidos.map((p) => p.id));
console.log("Pedidos inválidos:", pedidosInvalidos.map((p) => p.id));

const pedidosPagos = pedidosValidos.filter((pedido) => pedido.status === "pago");
console.log("Pedidos válidos e pagos:", pedidosPagos.map((p) => p.id));

const totalFaturado = pedidosPagos.reduce((total, pedido) => total + pedido.valor, 0);
console.log(`Total faturado: R$ ${totalFaturado.toFixed(2)}`);

const textosPedidos = pedidosPagos.map(
  (pedido) => `${pedido.cliente} — R$ ${pedido.valor.toFixed(2)}`
);
textosPedidos.forEach((texto) => console.log(texto));


const listaPedidos = document.querySelector("#lista-pedidos");
textosPedidos.forEach((texto) => {
  const li = document.createElement("li");
  li.textContent = texto;
  listaPedidos.append(li);
});
document.querySelector("#total-faturado").textContent =
  `Total faturado: R$ ${totalFaturado.toFixed(2)}`;


function mostrarStatus(elemento, mensagem, tipo = "") {
  elemento.textContent = mensagem;
  elemento.className = `status ${tipo}`.trim();
}


const formCep = document.querySelector("#form-cep");
const campoCep = document.querySelector("#cep");
const botaoCep = document.querySelector("#botao-cep");
const statusCep = document.querySelector("#status-cep");
const resultadoCep = document.querySelector("#resultado-cep");
const listaHistorico = document.querySelector("#historico-cep");


const historicoCep = [];


const limparCep = (valor) => valor.trim().replace(/\D/g, "");


const ehCepValido = (cep) => /^\d{8}$/.test(cep);

async function buscarCep(cep) {
  
  const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
    signal: AbortSignal.timeout(5000),
  });

  
  if (!response.ok) {
    throw new Error(`Erro HTTP ${response.status}`);
  }

  return response.json(); 
}

function exibirEndereco(endereco) {
  resultadoCep.replaceChildren(); 

  const campos = [
    ["Rua", endereco.logradouro],
    ["Bairro", endereco.bairro],
    ["Cidade", endereco.localidade],
    ["UF", endereco.uf],
  ];

  campos.forEach(([rotulo, valor]) => {
    const dt = document.createElement("dt");
    dt.textContent = rotulo;

    const dd = document.createElement("dd");
    dd.textContent = valor || "—"; 

    resultadoCep.append(dt, dd);
  });
}

function registrarHistorico(cep, endereco) {
  historicoCep.push({
    cep,
    cidade: endereco.localidade,
    uf: endereco.uf,
    horario: new Date().toLocaleTimeString("pt-BR"),
  });

  listaHistorico.replaceChildren();
  historicoCep.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = `${item.cep} — ${item.cidade}/${item.uf} (${item.horario})`;
    listaHistorico.append(li);
  });

  console.log("Histórico de CEPs:", historicoCep);
}

formCep.addEventListener("submit", async (e) => {
  e.preventDefault(); 

  const cep = limparCep(campoCep.value);
  if (!ehCepValido(cep)) {
    resultadoCep.replaceChildren();
    mostrarStatus(statusCep, "CEP inválido: digite 8 números.", "erro");
    return;
  }


  mostrarStatus(statusCep, "Buscando...", "carregando");
  botaoCep.disabled = true;
  resultadoCep.replaceChildren();

  try {
    const endereco = await buscarCep(cep);

   
    if (endereco.erro) {
      mostrarStatus(statusCep, "CEP não encontrado.", "vazio");
      return;
    }


    exibirEndereco(endereco);
    mostrarStatus(statusCep, ""); 
    registrarHistorico(cep, endereco);
  } catch (erro) {
    
    console.error("Falha ao buscar CEP:", erro);
    const mensagem =
      erro.name === "TimeoutError"
        ? "O servidor demorou demais para responder. Tente novamente."
        : "Falha na conexão. Verifique sua internet e tente novamente.";
    mostrarStatus(statusCep, mensagem, "erro");
  } finally {
    botaoCep.disabled = false; 
  }
});

//mini pokedex
const formPokemon = document.querySelector("#form-pokemon");
const campoPokemon = document.querySelector("#pokemon");
const botaoPokemon = document.querySelector("#botao-pokemon");
const statusPokemon = document.querySelector("#status-pokemon");
const resultadoPokemon = document.querySelector("#resultado-pokemon");

async function buscarPokemon(nome) {
  const response = await fetch(
    `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(nome)}`,
    { signal: AbortSignal.timeout(5000) }
  );

 
  if (response.status === 404) {
    const erro = new Error("Pokémon não encontrado");
    erro.name = "NaoEncontrado";
    throw erro;
  }
  if (!response.ok) {
    throw new Error(`Erro HTTP ${response.status}`);
  }

  return response.json();
}

function exibirPokemon(pokemon) {
  resultadoPokemon.replaceChildren();

  const imagem = document.createElement("img");
  imagem.src = pokemon.sprites.front_default ?? "";
  imagem.alt = `Imagem de ${pokemon.name}`;

  const nome = document.createElement("h3");
  nome.textContent = pokemon.name;

  const listaTipos = document.createElement("ul");
  listaTipos.className = "tipos";
  pokemon.types.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item.type.name;
    listaTipos.append(li);
  });

  if (pokemon.sprites.front_default) {
    resultadoPokemon.append(imagem);
  }
  resultadoPokemon.append(nome, listaTipos);
}

formPokemon.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = campoPokemon.value.trim().toLowerCase();
  if (nome === "") {
    resultadoPokemon.replaceChildren();
    mostrarStatus(statusPokemon, "Digite o nome de um Pokémon.", "vazio");
    return;
  }


  mostrarStatus(statusPokemon, "Buscando...", "carregando");
  botaoPokemon.disabled = true;
  resultadoPokemon.replaceChildren();

  try {
    const pokemon = await buscarPokemon(nome);


    exibirPokemon(pokemon);
    mostrarStatus(statusPokemon, "");
    console.log("Pokémon encontrado:", pokemon.name, pokemon.types.map((t) => t.type.name));
  } catch (erro) {
    if (erro.name === "NaoEncontrado") {
      // Estado: VAZIO / NÃO ENCONTRADO (404)
      mostrarStatus(statusPokemon, "Pokémon não encontrado.", "vazio");
    } else {
      // Estado: ERRO (rede, timeout ou outro erro HTTP)
      console.error("Falha ao buscar Pokémon:", erro);
      mostrarStatus(statusPokemon, "Falha na conexão. Tente novamente.", "erro");
    }
  } finally {
    botaoPokemon.disabled = false;
  }
});


console.log("\n========== Event Loop ==========");
console.log("1. Síncrono");
setTimeout(() => console.log("4. Tarefa (setTimeout)"), 0);
Promise.resolve().then(() => console.log("3. Microtarefa (Promise)"));
console.log("2. Síncrono");
