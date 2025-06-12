import './assets/style.css';
import { UsuarioSchema } from './validators/UsuarioSchema';

const formulario = document.querySelector<HTMLFormElement>("#form-cadastro")!;
const nome = document.querySelector<HTMLInputElement>("#nome")!;
const email = document.querySelector<HTMLInputElement>("#email")!;
const cep = document.querySelector<HTMLInputElement>("#cep")!;
const logradouro = document.querySelector<HTMLInputElement>("#logradouro")!;
const numero = document.querySelector<HTMLInputElement>("#numero")!;
const bairro = document.querySelector<HTMLInputElement>("#bairro")!;
const cidade = document.querySelector<HTMLSelectElement>("#cidade")!;
const estado = document.querySelector<HTMLSelectElement>("#estado")!;
const cursos = document.querySelector<HTMLSelectElement>("#cursos")!;

// Script para dark mode da página
function toggleMode() {
  const html = document.documentElement
  html.classList.toggle("dark");
}

(window as any).toggleMode = toggleMode;

// Função para limpar campos
function limparFormulario() {
  logradouro.value = '';
  numero.value = '';
  bairro.value = '';
  cidade.innerHTML = '<option value="">Selecione uma Cidade</option>';
  estado.innerHTML = '<option value="">Selecione um Estado</option>';
}

// Evento para post do cadastro no json server
formulario.addEventListener("submit", async(form) => {
  form.preventDefault();

  // Obter dados
  const sexoSelecionado = (document.querySelector<HTMLInputElement>('input[name=sexo]:checked')?.value);

  const dadosEnviados = {
    nome: nome.value,
    email: email.value,
    sexo: sexoSelecionado,
    cep: cep.value,
    logradouro: logradouro.value,
    numero: numero.value,
    bairro: bairro.value,
    cidade: cidade.value,
    estado: estado.value,
    curso: cursos.options[cursos.selectedIndex].text,
    observacoes: (document.querySelector<HTMLTextAreaElement>("#observacoes")?.value) || "",
  };

  const resultado = UsuarioSchema.safeParse(dadosEnviados);

  if(!resultado.success) {
    alert(resultado.error.errors.map(e => e.message).join('\n'));
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/usuarios" , {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dadosEnviados),
    });

    if(!res.ok) {
      throw new Error("Erro ao salvar usuário");
    }

    alert("Cadastrado efetuado com sucesso!");
    formulario.reset();
    limparFormulario();
    await preencherEstados();
  } catch (err) {
    alert("Erro ao efetuar o cadastro! Tente novamente...");
    console.error(err);
  }
})


// Carregar estados
async function obterEstados() {
  const resultado = await fetch(`https://brasilapi.com.br/api/ibge/uf/v1`);
  return await resultado.json();
}

// Função que vai preencher o estado ao colocar o cep
async function preencherEstados() {
  const listaEstados = await obterEstados();
  listaEstados.forEach((uf: { sigla: string; nome: string }) => {
    const option = document.createElement("option");
    option.value = uf.sigla;
    option.textContent = uf.nome;
    estado.appendChild(option);
  });
}


// Obter cidades por estado
async function obterCidades(uf: string) {
  const resultado = await fetch(`https://brasilapi.com.br/api/ibge/municipios/v1/${uf}`);
  return await resultado.json();
}


async function preencherCidades(uf: string) {
  const listaCidades = await obterCidades(uf);
  cidade.innerHTML = '<option value="">Selecione uma Cidade</option>';
  listaCidades.forEach((c: { nome: string }) => {
    const option = document.createElement("option");
    option.value = c.nome;
    option.textContent = c.nome;
    cidade.appendChild(option);
  });
}


// Consultar CEP
async function consultarCep() {
  const valorCep = cep.value.replace(/\D/g, '');
  if (!valorCep) return;

  try {
    const resultado = await fetch(`https://brasilapi.com.br/api/cep/v1/${valorCep}`);
    if (!resultado.ok) throw new Error("CEP inválido");

    const body = await resultado.json();
    logradouro.value = body.street;
    bairro.value = body.neighborhood;
    numero.focus();

    estado.value = body.state;
    await preencherCidades(body.state);

    const cidadeNome = (body.city || "").toLowerCase();
    for (const option of cidade.options) {
      const optionNome = option.value.toLowerCase();
      if (optionNome === cidadeNome) {
        cidade.value = option.value;
        break;
      }
    }

  } catch (err) {
    alert("Erro ao buscar CEP.");
    console.error(err);
  }
}


cep.addEventListener("blur", consultarCep);

estado.addEventListener("change", async () => {
  const uf = estado.value;
  if (uf) {
    await preencherCidades(uf);
  }
});

preencherEstados();