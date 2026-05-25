/**
 * Mock server para a demo no Vercel.
 *
 * Por que existe: o backend Express (server/index.js) não roda no Vercel.
 * Em produção, interceptamos chamadas a localhost:3001 e respondemos com
 * dados em memória — assim a UI funciona como demo navegável.
 *
 * Em dev (localhost), o fetch real roda normalmente.
 */

type Cliente = {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  createdAt: string;
};

type Veiculo = {
  id: string;
  clienteId: string;
  placa: string;
  marca: string;
  modelo: string;
  ano?: number;
  createdAt: string;
  cliente?: { id: string; nome: string };
};

type Ordem = {
  id: string;
  veiculoId: string;
  descricao: string;
  valor: number;
  status: "Aberta" | "Em Andamento" | "Concluída";
  createdAt: string;
  updatedAt: string;
  veiculo?: Veiculo;
  cliente?: Cliente;
};

const now = () => new Date().toISOString();

const seed = () => {
  const clientes: Cliente[] = [
    { id: "1", nome: "Maria Silva", telefone: "(77) 99888-7777", email: "maria@email.com", createdAt: now() },
    { id: "2", nome: "João Oliveira", telefone: "(77) 98876-5432", email: "joao@email.com", createdAt: now() },
    { id: "3", nome: "Carlos Mendes", telefone: "(77) 99123-4567", email: "carlos@email.com", createdAt: now() },
    { id: "4", nome: "Ana Costa", telefone: "(77) 98321-9876", email: "ana@email.com", createdAt: now() },
  ];

  const veiculos: Veiculo[] = [
    { id: "1", clienteId: "1", placa: "ABC1D23", marca: "Honda", modelo: "Civic", ano: 2020, createdAt: now() },
    { id: "2", clienteId: "2", placa: "DEF5G67", marca: "Toyota", modelo: "Corolla", ano: 2019, createdAt: now() },
    { id: "3", clienteId: "3", placa: "GHI9J01", marca: "Volkswagen", modelo: "Gol", ano: 2018, createdAt: now() },
    { id: "4", clienteId: "4", placa: "KLM2N34", marca: "Hyundai", modelo: "HB20", ano: 2021, createdAt: now() },
  ];

  const ordens: Ordem[] = [
    { id: "1", veiculoId: "1", descricao: "Troca de óleo e filtros", valor: 250, status: "Aberta", createdAt: now(), updatedAt: now() },
    { id: "2", veiculoId: "2", descricao: "Revisão completa de 60mil km", valor: 850, status: "Em Andamento", createdAt: now(), updatedAt: now() },
    { id: "3", veiculoId: "3", descricao: "Alinhamento e balanceamento", valor: 180, status: "Concluída", createdAt: now(), updatedAt: now() },
    { id: "4", veiculoId: "4", descricao: "Troca de pastilhas de freio", valor: 420, status: "Aberta", createdAt: now(), updatedAt: now() },
    { id: "5", veiculoId: "1", descricao: "Verificação do sistema elétrico", valor: 150, status: "Concluída", createdAt: now(), updatedAt: now() },
  ];

  return { clientes, veiculos, ordens };
};

const enrich = (state: ReturnType<typeof seed>) => {
  state.veiculos.forEach((v) => {
    const c = state.clientes.find((c) => c.id === v.clienteId);
    if (c) v.cliente = { id: c.id, nome: c.nome };
  });
  state.ordens.forEach((o) => {
    const v = state.veiculos.find((v) => v.id === o.veiculoId);
    if (v) {
      o.veiculo = v;
      const c = state.clientes.find((c) => c.id === v.clienteId);
      if (c) o.cliente = c;
    }
  });
};

const ok = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const isProduction = () => {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host !== "localhost" && host !== "127.0.0.1" && host !== "";
};

export function installMockServer() {
  if (!isProduction()) return;

  const state = seed();
  enrich(state);

  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

    if (!url.includes("localhost:3001")) {
      return originalFetch(input, init);
    }

    const path = url.replace(/^https?:\/\/localhost:3001/, "");
    const method = (init?.method || "GET").toUpperCase();
    const body = init?.body ? JSON.parse(init.body as string) : undefined;

    // simula latência sutil pra parecer real
    await new Promise((r) => setTimeout(r, 120));

    // health
    if (path === "/health") {
      return ok({ status: "API Oficina Mecânica - Demo Mode", endpoints: ["clientes", "veiculos", "ordens"] });
    }

    // clientes
    if (path === "/clientes" && method === "GET") return ok(state.clientes);
    if (path === "/clientes" && method === "POST") {
      const c: Cliente = { id: String(state.clientes.length + 1), createdAt: now(), ...body };
      state.clientes.push(c);
      return ok({ message: "Cliente cadastrado (demo)", clienteId: c.id, cliente: c }, 201);
    }
    if (path.startsWith("/clientes/") && method === "GET") {
      const id = path.split("/")[2];
      const c = state.clientes.find((c) => c.id === id);
      return c ? ok(c) : ok({ error: "Cliente não encontrado" }, 404);
    }

    // veiculos
    if (path === "/veiculos" && method === "GET") return ok(state.veiculos);
    if (path === "/veiculos" && method === "POST") {
      const v: Veiculo = { id: String(state.veiculos.length + 1), createdAt: now(), ...body };
      const c = state.clientes.find((c) => c.id === v.clienteId);
      if (c) v.cliente = { id: c.id, nome: c.nome };
      state.veiculos.push(v);
      return ok({ message: "Veículo cadastrado (demo)", veiculoId: v.id, veiculo: v }, 201);
    }

    // ordens
    if (path === "/ordens" && method === "GET") return ok(state.ordens);
    if (path === "/ordens" && method === "POST") {
      const o: Ordem = {
        id: String(state.ordens.length + 1),
        status: "Aberta",
        createdAt: now(),
        updatedAt: now(),
        ...body,
      };
      const v = state.veiculos.find((v) => v.id === o.veiculoId);
      if (v) {
        o.veiculo = v;
        const c = state.clientes.find((c) => c.id === v.clienteId);
        if (c) o.cliente = c;
      }
      state.ordens.push(o);
      return ok({ message: "Ordem criada (demo)", ordemId: o.id, ordem: o }, 201);
    }
    if (path.startsWith("/ordens/") && path.endsWith("/status") && method === "PUT") {
      const id = path.split("/")[2];
      const o = state.ordens.find((o) => o.id === id);
      if (!o) return ok({ error: "Ordem não encontrada" }, 404);
      o.status = body.status;
      o.updatedAt = now();
      return ok({ message: "Status atualizado (demo)", ordem: o });
    }

    return ok({ error: "Rota não implementada no mock" }, 404);
  };

  // banner visual avisando que é demo
  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", () => {
      const banner = document.createElement("div");
      banner.textContent = "🎭 Modo demo · dados de exemplo (backend não está deployado)";
      banner.style.cssText =
        "position:fixed;top:0;left:0;right:0;background:#1f2937;color:#fbbf24;text-align:center;padding:6px;font-size:12px;font-family:system-ui,sans-serif;z-index:9999;border-bottom:1px solid #374151";
      document.body.prepend(banner);
      document.body.style.paddingTop = "32px";
    });
  }

  console.info("[mock] OFICINA running in demo mode — backend calls intercepted");
}
