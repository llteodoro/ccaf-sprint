/* CCA-F Sprint · conteúdo do plano (original, baseado nos task statements do guia oficial CCAR-F v1.0) */
window.CCA = (() => {
const DOMAINS = {
  1:{n:"Agentic Architecture & Orchestration", s:"Agentic", w:27},
  2:{n:"Tool Design & MCP Integration", s:"Tools & MCP", w:18},
  3:{n:"Claude Code Configuration & Workflows", s:"Claude Code", w:20},
  4:{n:"Prompt Engineering & Structured Output", s:"Prompt & Output", w:20},
  5:{n:"Context Management & Reliability", s:"Context", w:15}
};

const SCEN = {
  1:"Customer Support Resolution Agent",
  2:"Code Generation with Claude Code",
  3:"Multi-Agent Research System",
  4:"Developer Productivity with Claude",
  5:"Claude Code for Continuous Integration",
  6:"Structured Data Extraction"
};

const TASKS = {
  "1.1":{d:1,pt:"Agentic loop e stop_reason",en:"Agentic loops: continue on stop_reason tool_use, stop on end_turn, append tool results to history"},
  "1.2":{d:1,pt:"Coordinator e subagents (hub-and-spoke)",en:"Coordinator-subagent orchestration, hub-and-spoke routing, dynamic subagent selection, iterative refinement"},
  "1.3":{d:1,pt:"Task tool, contexto explícito, paralelismo",en:"Spawning subagents with the Task tool, allowedTools, explicit context passing, parallel Task calls"},
  "1.4":{d:1,pt:"Enforcement programático e handoff",en:"Programmatic enforcement of workflow order, multi-concern decomposition, structured human handoff"},
  "1.5":{d:1,pt:"Hooks: interceptar e normalizar",en:"Agent SDK hooks: PostToolUse normalization and outgoing tool-call interception for compliance"},
  "1.6":{d:1,pt:"Decomposição: chaining vs dinâmica",en:"Task decomposition: prompt chaining vs dynamic adaptive decomposition"},
  "1.7":{d:1,pt:"Sessões: resume, fork, recomeço",en:"Session resumption with --resume, fork_session, fresh start with structured summary"},
  "2.1":{d:2,pt:"Descrições de tools e fronteiras",en:"Tool descriptions and boundaries, renaming or splitting overlapping tools"},
  "2.2":{d:2,pt:"Erros estruturados no MCP",en:"Structured MCP error responses: isError, errorCategory, isRetryable, empty vs failed"},
  "2.3":{d:2,pt:"Distribuição de tools e tool_choice",en:"Scoping tools per agent, constrained tools, tool_choice auto/any/forced"},
  "2.4":{d:2,pt:"MCP no Claude Code",en:"MCP servers in Claude Code: .mcp.json vs ~/.claude.json, env var expansion, MCP resources"},
  "2.5":{d:2,pt:"Built-in tools",en:"Built-in tools: Grep for content, Glob for paths, Edit vs Read+Write"},
  "3.1":{d:3,pt:"CLAUDE.md: hierarquia e /memory",en:"CLAUDE.md hierarchy (user, project, directory), @import, .claude/rules, /memory"},
  "3.2":{d:3,pt:"Slash commands e skills",en:"Project vs user slash commands, skills with context: fork, allowed-tools, argument-hint"},
  "3.3":{d:3,pt:"Rules com paths (glob)",en:"Path-scoped rules in .claude/rules with YAML paths globs"},
  "3.4":{d:3,pt:"Plan mode vs direct",en:"Plan mode vs direct execution, Explore subagent"},
  "3.5":{d:3,pt:"Refinamento iterativo",en:"Iterative refinement: input/output examples, test-driven iteration, interview pattern, batching interacting fixes"},
  "3.6":{d:3,pt:"Claude Code em CI/CD",en:"Claude Code in CI: -p, --output-format json, --json-schema, prior findings, independent reviewer"},
  "4.1":{d:4,pt:"Critérios explícitos",en:"Explicit review criteria to reduce false positives, severity definitions"},
  "4.2":{d:4,pt:"Few-shot",en:"Few-shot examples for ambiguous cases, format consistency and extraction"},
  "4.3":{d:4,pt:"tool_use + JSON schema",en:"Structured output with tool_use and JSON schemas, nullable fields, enum other/unclear, tool_choice"},
  "4.4":{d:4,pt:"Validação, retry e feedback",en:"Validation-retry loops with error feedback, limits of retry, semantic validation"},
  "4.5":{d:4,pt:"Message Batches API",en:"Message Batches API: when to use, custom_id, failure handling, SLA math"},
  "4.6":{d:4,pt:"Review multi-instância e multi-pass",en:"Independent review instances and multi-pass reviews (per-file plus integration)"},
  "5.1":{d:5,pt:"Contexto em conversas longas",en:"Preserving facts in long conversations: case facts block, lost in the middle, trimming tool output"},
  "5.2":{d:5,pt:"Escalonamento e ambiguidade",en:"Escalation triggers and ambiguity resolution in support agents"},
  "5.3":{d:5,pt:"Propagação de erro",en:"Error propagation across multi-agent systems with structured context and partial results"},
  "5.4":{d:5,pt:"Contexto em codebase grande",en:"Context management in long codebase exploration: scratchpads, subagents, /compact, manifests"},
  "5.5":{d:5,pt:"Revisão humana e calibração",en:"Human review workflows, segmented accuracy, stratified sampling, calibrated confidence"},
  "5.6":{d:5,pt:"Proveniência e incerteza",en:"Provenance in multi-source synthesis: claim-source mappings, conflicts, dates"}
};

/* Pílula de task: c = conceito (3 min), kata = prática (12 min), sol = referência */
const LESSONS = {
"1.1":{c:[
"Loop: chama a API, olha stop_reason, executa as tools pedidas, devolve tool_result no histórico, repete",
"Continua em \"tool_use\". Para em \"end_turn\"",
"Anti-patterns: parar porque veio texto, procurar \"done\" no texto, cap de iterações como critério principal"],
kata:"Escreva de memória o loop (Python ou pseudo-código). Depois liste os 3 anti-patterns sem olhar.",
lang:"python",
sol:`messages = [{"role": "user", "content": task}]
while True:
    r = client.messages.create(model=MODEL, max_tokens=2048,
                               tools=TOOLS, messages=messages)
    messages.append({"role": "assistant", "content": r.content})
    if r.stop_reason != "tool_use":      # "end_turn": terminou
        break
    results = [{"type": "tool_result", "tool_use_id": b.id,
                "content": run_tool(b.name, b.input)}
               for b in r.content if b.type == "tool_use"]
    messages.append({"role": "user", "content": results})

# Anti-patterns: "veio texto = acabou", parse de "done",
# max_iterations como critério principal (só rede de segurança)`},

"1.2":{c:[
"Hub-and-spoke: todo tráfego entre subagents passa pelo coordinator (observabilidade, erro consistente, fluxo controlado)",
"O coordinator decompõe, escolhe quais subagents chamar pela complexidade e agrega",
"Subagents corretos e relatório incompleto: a decomposição do coordinator foi estreita"],
kata:"Desenhe em 3 min o sistema de research (coordinator + search, analysis, synthesis, report). Marque onde ficam: decomposição, seleção dinâmica, loop de refinamento e tratamento de erro.",
lang:"text",
sol:`Coordinator
 1. decompõe o tema em subtópicos que cobrem o escopo inteiro
 2. escolhe só os subagents que a pergunta exige
 3. dispara em paralelo (vários Task na mesma resposta)
 4. recebe resultados e erros estruturados
 5. avalia a síntese procurando gaps
 6. re-delega buscas direcionadas e re-sintetiza
Subagents nunca falam entre si.`},

"1.3":{c:[
"Subagent nasce pela Task tool. O coordinator precisa de \"Task\" em allowedTools",
"Contexto do subagent = só o prompt dele. Sem herança, sem memória compartilhada",
"Paralelo = vários Task na MESMA resposta. Passe dados estruturados, com metadata separada (url, doc, página, data)"],
kata:"Escreva o prompt de Task que o coordinator manda ao subagent de síntese, com os findings em formato estruturado.",
lang:"text",
sol:`Goal: synthesize a cited report on <topic>.
Quality bar: every claim keeps its source; flag conflicts and gaps.
Findings (JSON):
[{"claim": "...", "evidence": "...", "source_url": "...",
  "doc": "...", "page": 12, "published": "2025-06"}]

# Objetivo + critério de qualidade. Nada de passo a passo.`},

"1.4":{c:[
"Regra que não pode falhar (identidade antes de refund) = enforcement programático, não prompt",
"Prompt bem escrito ainda tem taxa de falha acima de zero",
"Escalou para humano que não vê o transcript: handoff estruturado com ID, causa raiz, valores, ações feitas e recomendação"],
kata:"Escreva em pseudo-código o gate que bloqueia process_refund até get_customer devolver um customer_id verificado. Depois o JSON do handoff.",
lang:"python",
sol:`def before_tool(name, args, session):
    if name in ("lookup_order", "process_refund") \\
       and not session.get("verified_customer_id"):
        return deny("Call get_customer and verify identity first")
    return allow()

handoff = {"customer_id": "C-4821", "issues": ["duplicate charge"],
           "root_cause": "payment retried after timeout",
           "amount": 89.90, "actions_taken": ["identity verified"],
           "recommended_action": "refund the duplicate charge"}`},

"1.5":{c:[
"PostToolUse: transforma o resultado da tool antes do modelo ver (datas, códigos de status)",
"Interceptar a chamada de saída (PreToolUse): bloqueia ou redireciona antes de executar",
"Garantia determinística = hook. Preferência provável = prompt"],
kata:"Escreva 2 hooks em pseudo-código: (a) bloqueia refund acima de 500 e manda para escalate_to_human; (b) normaliza Unix timestamp e ISO 8601 para um formato só.",
lang:"python",
sol:`def pre_tool_use(name, args):
    if name == "process_refund" and args["amount"] > 500:
        return {"decision": "deny",
                "reason": "Over $500: call escalate_to_human with a summary"}

def post_tool_use(name, result):
    for k in ("created_at", "shipped_at"):
        if isinstance(result.get(k), int):   # Unix epoch
            result[k] = to_iso8601(result[k])
    return result

# Pseudo-código: a assinatura real depende do SDK. A prova cobra o padrão.`},

"1.6":{c:[
"Fluxo previsível e multi-aspecto: prompt chaining (passos fixos)",
"Investigação aberta: decomposição dinâmica, subtarefas geradas pelo que se descobre",
"Review grande: pass por arquivo + 1 pass de integração"],
kata:"Classifique: (a) review de PR com segurança, performance e estilo; (b) incidente com causa desconhecida; (c) release notes de 30 commits; (d) \"adicione testes a um legado de 200k linhas\".",
lang:"text",
sol:`(a) chaining
(b) dinâmica
(c) chaining
(d) dinâmica: mapear estrutura, achar áreas de alto impacto,
    plano priorizado que se adapta às dependências`},

"1.7":{c:[
"--resume <nome>: continua uma sessão nomeada",
"fork_session: ramos independentes a partir da mesma análise",
"Tool results velhos: sessão nova com resumo estruturado. Poucos arquivos mudaram: resume e diga quais"],
kata:"Escolha: (1) continuar a investigação auth-bug de ontem, nada mudou; (2) comparar 2 estratégias de teste a partir da mesma análise; (3) metade dos arquivos foi reescrita; (4) 2 de 40 arquivos mudaram.",
lang:"text",
sol:`(1) --resume auth-bug
(2) fork_session
(3) sessão nova + resumo estruturado injetado
(4) --resume e informe os 2 arquivos para re-análise direcionada`},

"2.1":{c:[
"A descrição é o principal sinal que o modelo usa para escolher a tool",
"Boa descrição: o que faz, formato de input, exemplo de pedido, edge cases e quando usar a outra",
"Tools sobrepostas: renomeie e separe. Tool genérica demais: divida em tools com contrato claro"],
kata:"Reescreva a descrição de uma tool sua (ex: o pp-review) com propósito, input, 1 exemplo de pedido, 1 edge case e quando NÃO usar.",
lang:"text",
sol:`name: review_deployment_config
description: Validates a deployment config (YAML) against the internal
  platform docs and returns violations with doc links.
  Input: path to a Helm values file or AKS manifest.
  Use for: "is this values.yaml ready for prod?"
  Not for: provisioning or applying changes (use provision_app).
  Edge case: multi-document YAML is split and checked per document.`},

"2.2":{c:[
"Falha de tool no MCP: isError: true + metadata estruturada",
"Categorias: transient, validation, business (política), permission. Inclua isRetryable e mensagem legível",
"Vazio válido (busca sem resultado) é diferente de falha de acesso (timeout)"],
kata:"Escreva o resultado MCP para: (a) timeout no serviço de pedidos; (b) refund bloqueado por política.",
lang:"json",
sol:`{"isError": true, "content": [{"type": "text", "text":
  "{\\"errorCategory\\":\\"transient\\",\\"isRetryable\\":true,\\"message\\":\\"Order service timed out after 5s\\"}"}]}

{"isError": true, "content": [{"type": "text", "text":
  "{\\"errorCategory\\":\\"business\\",\\"isRetryable\\":false,\\"message\\":\\"Refunds after 90 days need manager approval\\"}"}]}`},

"2.3":{c:[
"Tools demais (18) derrubam a precisão da escolha. Escopo de 4 a 5 por papel",
"Tool cross-role só para necessidade frequente e simples (ex: verify_fact na síntese). Tool genérica vira tool restrita",
"tool_choice: auto (pode responder texto), any (precisa chamar alguma), tool + name (precisa chamar aquela)"],
kata:"Escreva os 3 valores de tool_choice no formato da API e um caso de uso para cada.",
lang:"js",
sol:`{"type": "auto"}                               // conversa normal
{"type": "any"}                                // tipo de doc desconhecido, quero tool
{"type": "tool", "name": "extract_metadata"}   // obrigar o primeiro passo`},

"2.4":{c:[
".mcp.json no projeto = servidor do time (versionado). ~/.claude.json = pessoal ou experimental",
"Segredo via expansão de variável (${TOKEN}) no .mcp.json, nunca commitado",
"MCP resources expõem catálogos (schemas, docs, issues) e cortam chamadas exploratórias"],
kata:"Escreva de memória um .mcp.json com um servidor do time que lê o token de uma variável de ambiente.",
lang:"json",
sol:`{
  "mcpServers": {
    "deployments": {
      "command": "npx",
      "args": ["-y", "@acme/deploy-mcp"],
      "env": { "DEPLOY_API_TOKEN": "\${DEPLOY_API_TOKEN}" }
    }
  }
}
// Pessoal: ~/.claude.json. Jira: servidor da comunidade. Custom: só fluxo do time.`},

"2.5":{c:[
"Grep = conteúdo (quem chama a função, onde está a mensagem de erro)",
"Glob = caminho e nome (**/*.test.tsx)",
"Edit falhou por âncora repetida: Read + Write. Explorar: Grep acha a entrada, Read segue os imports"],
kata:"Escolha a tool: (1) todos os *.spec.ts; (2) onde PaymentTimeoutError é lançado; (3) trocar uma linha única; (4) Edit falhou porque o trecho aparece 3 vezes; (5) entender o checkout num repo novo.",
lang:"text",
sol:`(1) Glob
(2) Grep
(3) Edit
(4) Read + Write
(5) Grep pelo ponto de entrada, depois Read seguindo imports.
    Nada de ler tudo antes.`},

"3.1":{c:[
"Hierarquia: ~/.claude/CLAUDE.md (só você), projeto (CLAUDE.md na raiz ou .claude/CLAUDE.md), subdiretório",
"Instrução do time no nível user não chega no colega",
"@import modulariza. .claude/rules/ divide por tema. /memory mostra o que carregou"],
kata:"Desenhe a árvore de memória de um monorepo com packages/api e packages/web. Onde fica cada coisa e o que vai para o git?",
lang:"text",
sol:`~/.claude/CLAUDE.md        # pessoal, fora do git
CLAUDE.md                  # padrões do time (git)
.claude/rules/testing.md   # regra por tema (git)
packages/api/CLAUDE.md     # @docs/standards/api.md
packages/web/CLAUDE.md     # @docs/standards/a11y.md
# Comportamento inconsistente entre sessões? /memory`},

"3.2":{c:[
".claude/commands/ = comando do time (git). ~/.claude/commands/ = pessoal",
"Skill em .claude/skills/<nome>/SKILL.md. context: fork isola, allowed-tools restringe, argument-hint pede parâmetro",
"Skill = sob demanda. CLAUDE.md = sempre carregado. Variante pessoal: ~/.claude/skills/ com outro nome"],
kata:"Escreva o frontmatter de uma skill /analyze-deps que roda isolada, só lê arquivos e pede o nome do pacote.",
lang:"yaml",
sol:`---
name: analyze-deps
description: Map a package's dependencies and flag risky upgrades
context: fork
allowed-tools: Read, Grep, Glob
argument-hint: "<package-name>"
---`},

"3.3":{c:[
".claude/rules/*.md com frontmatter paths (glob) carrega só ao editar arquivos que batem",
"Ideal para convenção espalhada pelo repo (testes em todo lugar)",
"Nesses casos é melhor que CLAUDE.md por diretório"],
kata:"Escreva .claude/rules/terraform.md que só carrega em terraform/** com 3 regras suas de Terraform.",
lang:"markdown",
sol:`---
paths:
  - "terraform/**/*"
---
# Terraform
- Every resource carries tags: owner, env, cost-center
- No hardcoded region; use var.location
- Modules pinned to a version tag`},

"3.4":{c:[
"Plan mode: mudança grande, várias abordagens válidas, decisão de arquitetura, muitos arquivos",
"Direct: escopo claro, um arquivo, stack trace na mão",
"Explore subagent isola descoberta verbosa e devolve resumo"],
kata:"Classifique: (1) migrar a lib HTTP em 45 arquivos; (2) null check com stack trace; (3) monolito para microserviços; (4) validação de data num handler; (5) escolher entre fila e polling.",
lang:"text",
sol:`(1) plan   (2) direct   (3) plan   (4) direct   (5) plan
Comum: planejar a migração em plan mode, depois executar direto o plano.`},

"3.5":{c:[
"Prosa interpretada de jeitos diferentes: 2 a 3 exemplos concretos de input e output",
"Test-driven: escreva os testes antes e itere mostrando as falhas",
"Domínio novo: interview pattern. Problemas que interagem: uma mensagem. Independentes: um por vez"],
kata:"Escolha a técnica: (a) normalizar telefones dá resultado inconsistente; (b) cache num domínio que você não conhece; (c) 3 bugs que dependem um do outro; (d) migração quebra com null.",
lang:"text",
sol:`(a) exemplos de input/output
(b) interview pattern
(c) uma mensagem com os 3
(d) caso de teste específico com input e saída esperada`},

"3.6":{c:[
"CI: claude -p (ou --print) para não travar esperando input",
"--output-format json + --json-schema geram achados que a máquina lê (comentário inline no PR)",
"Re-review: passe os achados anteriores e peça só os novos ou não resolvidos. Revisor = instância independente"],
kata:"Escreva o comando do step de pipeline que revisa o PR e gera findings.json validado por schema.",
lang:"bash",
sol:`claude -p "$(cat .ci/review-prompt.md)" \\
  --output-format json \\
  --json-schema "$(cat .ci/review-schema.json)" > findings.json

# review-prompt.md: critérios explícitos + achados anteriores +
# "report only new or still-unaddressed issues".
# Padrões de teste e fixtures ficam no CLAUDE.md do projeto.`},

"4.1":{c:[
"Critério explícito vence \"seja conservador\" e \"só alta confiança\"",
"Diga o que reportar (bug, segurança) e o que ignorar (estilo, padrão local)",
"Categoria com muito falso positivo: desligue temporariamente. Severidade com exemplo de código por nível"],
kata:"Reescreva \"Review this PR. Only report high-confidence findings.\" com critérios explícitos e 3 níveis de severidade.",
lang:"text",
sol:`Report only:
- Bugs: behavior contradicts intent or tests
- Security: injection, authz bypass, secrets in code
Skip: naming, formatting, patterns used consistently in this repo.
Severity:
- critical: exploitable or data loss (SQL built from user input)
- major: wrong result on a normal path (off-by-one in pagination)
- minor: edge case with a workaround (empty list in a CLI flag)`},

"4.2":{c:[
"Instrução detalhada e resultado ainda inconsistente: few-shot",
"2 a 4 exemplos de casos ambíguos, mostrando por que a ação escolhida vence a alternativa",
"Few-shot também reduz extração vazia e alucinação em documentos de formatos variados"],
kata:"Escreva 2 exemplos few-shot para \"refund ou replacement?\" com o raciocínio.",
lang:"text",
sol:`Example 1
Customer: "The blender arrived cracked, I still want it."
Action: replacement. Why: they want the product; damage is covered.

Example 2
Customer: "It arrived late, I bought another one elsewhere."
Action: refund. Why: the need is gone; a replacement adds nothing.`},

"4.3":{c:[
"JSON garantido = tool_use com input_schema. Elimina erro de sintaxe, não erro semântico",
"Campo que pode faltar no documento: opcional ou nullable (evita invenção)",
"enum com \"other\" + campo de detalhe, e \"unclear\" para o ambíguo. Tipo de doc desconhecido: tool_choice any"],
kata:"Escreva a tool extract_invoice com invoice_number obrigatório, po_number nullable, category enum com other e unclear, stated_total.",
lang:"json",
sol:`{
  "name": "extract_invoice",
  "description": "Extract invoice fields. Use null when a field is not stated.",
  "input_schema": {
    "type": "object",
    "properties": {
      "invoice_number": {"type": "string"},
      "po_number": {"type": ["string", "null"]},
      "category": {"type": "string",
        "enum": ["software", "hardware", "services", "other", "unclear"]},
      "category_detail": {"type": ["string", "null"]},
      "stated_total": {"type": "number"},
      "calculated_total": {"type": "number"}
    },
    "required": ["invoice_number", "category", "stated_total"]
  }
}`},

"4.4":{c:[
"Retry com feedback: documento original + extração que falhou + erro de validação específico",
"Retry resolve formato e estrutura. Não resolve informação que não está no documento",
"Validação semântica: calculated_total vs stated_total, conflict_detected. detected_pattern para estudar falsos positivos"],
kata:"Retry resolve? (a) data em DD/MM em vez de ISO; (b) o PO está num anexo não enviado; (c) valor no campo errado; (d) total não bate com os itens.",
lang:"text",
sol:`(a) sim
(b) não: devolva null e mande para humano, ou consiga o anexo
(c) sim
(d) sim se o erro foi de extração; se o documento é inconsistente,
    marque conflict_detected`},

"4.5":{c:[
"Batch: 50% mais barato, até 24h de processamento, sem SLA de latência",
"Sem tool calling multi-turn dentro de um request. custom_id liga pedido e resposta",
"Bloqueante (pre-merge) fica no síncrono. Noturno e semanal vão para batch"],
kata:"SLA de 30h, batch leva até 24h. De quanto em quanto tempo enviar? E o que fazer com 23 falhas por tamanho num lote de 500?",
lang:"text",
sol:`Pior caso = espera até o próximo envio + 24h.
Janela de 4h: 28h, dentro do SLA. Janela de 8h: 32h, estoura.
Falhas: reenvie só os 23 custom_id, com chunking.
Antes do lote grande, refine o prompt numa amostra.`},

"4.6":{c:[
"Quem gerou o código revisa mal: carrega o próprio raciocínio",
"Instância independente, sem o contexto da geração, encontra mais",
"PR grande: pass por arquivo + pass de integração (fluxo de dados entre arquivos)"],
kata:"Desenhe a arquitetura de review para um PR de 20 arquivos gerado pelo Claude.",
lang:"text",
sol:`1. instância nova, sem o contexto da geração
2. 20 passes locais, um por arquivo
3. 1 pass de integração olhando o fluxo entre arquivos
4. achados com confiança por item para rotear a revisão humana`},

"5.1":{c:[
"Resumo progressivo perde números, datas e promessas. Guarde um bloco \"case facts\" fora do resumo",
"Lost in the middle: resumo dos achados no início e seções com cabeçalho",
"Corte o output de tool para os campos relevantes antes de acumular"],
kata:"Escreva o bloco CASE FACTS de um atendimento com 2 pedidos.",
lang:"text",
sol:`CASE FACTS (keep verbatim in every prompt)
customer_id: C-4821 (verified)
order #5521: refund $127.40 promised by Fri 11/27, pending
order #5530: replacement shipped 11/18
customer expects: email confirming both`},

"5.2":{c:[
"Pediu humano: escale na hora, sem investigar antes",
"Frustrado com caso simples: reconheça e resolva; escale se ele repetir o pedido",
"Política omissa: escale. Vários matches: peça outro identificador. Sentimento e confiança autodeclarada não servem de gatilho"],
kata:"Escale, resolva ou pergunte? (1) \"quero falar com uma pessoa\"; (2) irritado com rastreio parado; (3) exceção que a política não cobre; (4) 3 clientes com o mesmo nome; (5) troca padrão com foto do dano.",
lang:"text",
sol:`(1) escale
(2) resolva; escale se repetir o pedido
(3) escale
(4) pergunte: email ou número do pedido
(5) resolva`},

"5.3":{c:[
"Erro estruturado para o coordinator: tipo de falha, query tentada, resultado parcial, alternativas",
"O subagent resolve o transitório localmente e só propaga o que não resolveu",
"Anti-patterns: vazio marcado como sucesso, status genérico, derrubar o workflow inteiro"],
kata:"Escreva o que o subagent de busca devolve após timeout com 2 de 5 fontes lidas.",
lang:"json",
sol:`{"status": "partial",
 "failure_type": "timeout",
 "attempted_query": "grid battery cost 2025 2026",
 "retries": 2,
 "partial_results": [{"claim": "...", "source_url": "..."}],
 "alternatives": ["query IEA reports", "narrow to utility-scale"]}`},

"5.4":{c:[
"Sessão longa degrada: respostas genéricas em vez das classes que você achou",
"Defesas: scratchpad de achados, subagents para perguntas específicas, /compact, resumo entre fases",
"Crash multi-agente: cada agente exporta estado; o coordinator carrega um manifest no resume"],
kata:"Liste 4 defesas contra degradação de contexto e quando usar cada uma.",
lang:"text",
sol:`Scratchpad: sempre em exploração longa
Subagent: pergunta específica e verbosa ("ache todos os testes")
/compact: contexto cheio de saída de descoberta
Resumo de fase: antes de abrir a próxima fase
Manifest: recuperação de crash em multi-agente`},

"5.5":{c:[
"97% no total pode esconder um tipo de documento ruim. Segmente por tipo e por campo",
"Amostragem aleatória estratificada nas extrações de alta confiança",
"Confiança por campo calibrada com conjunto rotulado. Baixa confiança ou fonte contraditória vai para humano"],
kata:"A liderança quer tirar a revisão humana com 97% de acurácia. Escreva os 3 passos que você exige antes.",
lang:"text",
sol:`1. acurácia por tipo de documento e por campo
2. limiar de confiança por campo calibrado num conjunto rotulado
3. amostragem estratificada contínua das de alta confiança
   para medir erro e pegar padrões novos`},

"5.6":{c:[
"Resumir sem mapear claim para fonte perde a atribuição",
"Fontes boas discordam: mantenha os dois valores com fonte e marque o conflito",
"Exija data de publicação ou coleta. Renderize por tipo: finanças em tabela, notícia em prosa"],
kata:"Escreva o formato de finding que preserva proveniência, com um caso de conflito.",
lang:"json",
sol:`{"claim": "Adoption reached 41% in 2025",
 "source": {"url": "...", "doc": "Survey A", "page": 7,
            "published": "2025-09"},
 "conflict": {"other_value": "34%", "source": "Report B (2025-03)"},
 "status": "contested"}`}
};

/* Pílulas especiais */
const SPECIAL = {
diag:{title:"Diagnóstico às cegas", c:[
"10 questões, 2 por domínio, sem estudar antes",
"Ritmo de prova: 2 min por questão, feedback só no fim",
"Errar aqui é dado, não problema"], act:"diag"},
mapa:{title:"Mapa da prova", c:[
"60 itens em 120 min. 4 cenários sorteados de 6, então prepare os 6",
"Corte 720 em 1.000 (escala). O relatório mostra % por domínio",
"A prova é escrita contra o guia. Se a doc atual mudou, responda pelo guia"],
kata:"Abra a aba Prova e leia os padrões de distratores. Depois revise as erradas do diagnóstico e diga em voz alta qual padrão te pegou em cada uma.", act:"prova"},
mix:{title:"Mix espaçado", c:[
"Cards devidos hoje primeiro",
"Depois 5 questões dos temas já vistos, erradas primeiro",
"Domínio com 80% ou mais no mix: o próximo mix puxa o mais fraco"], act:"mix"},
simi:{title:"Simulado interno", c:[
"Sem feedback até o fim",
"2 min por questão, cronômetro ligado",
"No fim, revise só as erradas"], act:"simi"},
simx1:{title:"Simulado 1 · 60 questões no horário da prova", c:[
"Sáb 21/11 às 23:15, mesmo horário da prova, 120 min, sem consulta",
"Banco novo: /mock-exam do repo cert-study-kit (60 itens, relatório por domínio)",
"Compare com seus treinos de dia. Queda grande = reagendar até dom 22/11"],
steps:["git clone https://github.com/alexiocassanifm/anthropic-certifications.git","cd anthropic-certifications && pip install -r requirements.txt","claude","/mock-exam"], act:"simx"},
simx2:{title:"Simulado 2 · banco novo", c:[
"Questões que você ainda não viu: Tutorials Dojo (modo timed) ou claudecertifiedarchitects (30 q)",
"60 min, sem consulta, mesmo ritmo de 2 min",
"Registre o resultado: a revisão de quinta puxa os piores domínios"], act:"simx"},
labA:{title:"Lab A (opcional) · agent loop de verdade", c:[
"Python + SDK da Anthropic, 2 tools falsas: get_customer e process_refund",
"Loop por stop_reason, gate que exige get_customer antes do refund",
"Erro estruturado com isRetryable. Repo pessoal, nada de código ou dado de cliente"], act:"none"},
labB:{title:"Lab B (opcional) · Claude Code configurado", c:[
"Repo sandbox com CLAUDE.md e .claude/rules/terraform.md (paths)",
"Uma skill com context: fork e allowed-tools, um .mcp.json com ${VAR}",
"Rode /memory e um claude -p com --output-format json"], act:"none"},
sys:{title:"System test do OnVUE", c:[
"Mesmo computador, rede e cômodo da prova",
"Computador pessoal, sem VPN ou agente de segurança corporativo",
"O link está no email de confirmação da Pearson"], act:"prova"},
rev:{title:"Revisão dirigida", c:[
"Abra Status e pegue as 3 tasks mais fracas",
"Para cada uma: reler só o Conceito da pílula e fazer 3 questões",
"Nada de conteúdo novo"], act:"weak"},
cards:{title:"Cards em Revisar", c:[
"Só os cards marcados Revisar",
"Responda em voz alta antes de virar",
"Meta: zerar a pilha"], act:"cards"},
traps:{title:"Distratores + logística", c:[
"Releia os padrões de distratores",
"Confira o checklist da aba Prova",
"Último horário para reagendar: hoje, 23:15"], act:"prova"},
exam:{title:"Dia da prova", c:[
"13:20: 20 min de cards em Revisar. Nada novo",
"22:45 check-in no OnVUE · 23:15 prova",
"2 min por questão. Travou 3 min: marque, escolha a melhor e siga"], act:"prova"}
};

const PLAN = [
{date:"2026-11-10",tag:"Largada",p:[{id:"d01-1",k:"diag"},{id:"d01-2",k:"mapa"},{id:"d01-3",k:"task",t:"1.1"}]},
{date:"2026-11-11",tag:"Domínio 1",p:[{id:"d02-1",k:"task",t:"1.2"},{id:"d02-2",k:"task",t:"1.3"},{id:"d02-3",k:"mix"}]},
{date:"2026-11-12",tag:"Domínio 1",p:[{id:"d03-1",k:"task",t:"1.4"},{id:"d03-2",k:"task",t:"1.5"},{id:"d03-3",k:"mix"}]},
{date:"2026-11-13",tag:"Domínio 1",p:[{id:"d04-1",k:"task",t:"1.6"},{id:"d04-2",k:"task",t:"1.7"},{id:"d04-3",k:"mix"}]},
{date:"2026-11-14",tag:"Sábado longo",p:[{id:"d05-1",k:"task",t:"2.1"},{id:"d05-2",k:"task",t:"2.2"},{id:"d05-3",k:"task",t:"2.3"},{id:"d05-4",k:"simi",n:15,dom:[1,2],title:"Mini-simulado D1 + D2"},{id:"d05-5",k:"labA",opt:true}]},
{date:"2026-11-15",rest:true,tag:"Descanso"},
{date:"2026-11-16",tag:"Domínio 2",p:[{id:"d07-1",k:"task",t:"2.4"},{id:"d07-2",k:"task",t:"2.5"},{id:"d07-3",k:"mix"}]},
{date:"2026-11-17",tag:"Domínio 3",p:[{id:"d08-1",k:"task",t:"3.1"},{id:"d08-2",k:"task",t:"3.2"},{id:"d08-3",k:"mix"}]},
{date:"2026-11-18",tag:"Domínio 3",p:[{id:"d09-1",k:"task",t:"3.3"},{id:"d09-2",k:"task",t:"3.4"},{id:"d09-3",k:"mix"}]},
{date:"2026-11-19",tag:"Domínio 3",p:[{id:"d10-1",k:"task",t:"3.5"},{id:"d10-2",k:"task",t:"3.6"},{id:"d10-3",k:"mix"}]},
{date:"2026-11-20",tag:"Domínio 4 · feriado nacional",p:[{id:"d11-1",k:"task",t:"4.1"},{id:"d11-2",k:"task",t:"4.2"},{id:"d11-3",k:"task",t:"4.3"},{id:"d11-4",k:"labB",opt:true}]},
{date:"2026-11-21",tag:"Domínio 4 + Simulado 1",p:[{id:"d12-1",k:"task",t:"4.4"},{id:"d12-2",k:"task",t:"4.5"},{id:"d12-3",k:"task",t:"4.6"},{id:"d12-4",k:"simx1",night:true}]},
{date:"2026-11-22",rest:true,tag:"Descanso · decidir o horário"},
{date:"2026-11-23",tag:"Domínio 5",p:[{id:"d14-1",k:"task",t:"5.1"},{id:"d14-2",k:"task",t:"5.2"},{id:"d14-3",k:"task",t:"5.3"}]},
{date:"2026-11-24",tag:"Domínio 5",p:[{id:"d15-1",k:"task",t:"5.4"},{id:"d15-2",k:"task",t:"5.5"},{id:"d15-3",k:"task",t:"5.6"}]},
{date:"2026-11-25",tag:"Simulado 2",p:[{id:"d16-1",k:"simx2"},{id:"d16-2",k:"sys"}]},
{date:"2026-11-26",tag:"Revisão dirigida",p:[{id:"d17-1",k:"rev"},{id:"d17-2",k:"cards"},{id:"d17-3",k:"traps"}]},
{date:"2026-11-27",tag:"Dia da prova",p:[{id:"d18-1",k:"exam"}]}
];

/* Regras de decisão (flashcards): f = gatilho, b = resposta */
const CARDS = [
{id:"r01",t:"1.1",f:"Agentic loop: when do you continue, when do you stop?",b:"Continua em stop_reason \"tool_use\" (executa e devolve tool_result). Para em \"end_turn\". Nunca por texto, keyword ou cap de iterações."},
{id:"r02",t:"1.1",f:"Where do tool results go?",b:"No histórico, como tool_result com o tool_use_id, na próxima mensagem user."},
{id:"r03",t:"1.2",f:"Why route all subagent traffic through the coordinator?",b:"Hub-and-spoke: observabilidade, erro tratado de forma consistente, fluxo controlado."},
{id:"r04",t:"1.2",f:"Report misses whole subtopics, subagents did their jobs",b:"Decomposição estreita do coordinator. A causa está a montante."},
{id:"r05",t:"1.2",f:"Simple question runs the full pipeline",b:"O coordinator escolhe quais subagents chamar pela complexidade."},
{id:"r06",t:"1.2",f:"Synthesis has coverage gaps",b:"Refinamento iterativo: avalia, re-delega buscas direcionadas, re-sintetiza."},
{id:"r07",t:"1.3",f:"Subagent doesn't know earlier findings",b:"Não há herança de contexto. Passe tudo no prompt do Task, estruturado."},
{id:"r08",t:"1.3",f:"Coordinator never delegates",b:"\"Task\" está fora de allowedTools."},
{id:"r09",t:"1.3",f:"Run subagents in parallel",b:"Vários Task na MESMA resposta do coordinator."},
{id:"r10",t:"1.3",f:"How to write the coordinator's prompts",b:"Objetivo e critérios de qualidade, não passo a passo."},
{id:"r11",t:"1.4",f:"A rule that must ALWAYS hold (identity before refund)",b:"Gate programático ou hook. Prompt tem taxa de falha acima de zero."},
{id:"r12",t:"1.4",f:"Escalating to a human who can't see the transcript",b:"Handoff estruturado: ID, causa raiz, valores, ações feitas, recomendação."},
{id:"r13",t:"1.4",f:"Customer message with 3 issues",b:"Decompor, investigar em paralelo com contexto comum, uma resposta unificada."},
{id:"r14",t:"1.5",f:"Tools return epoch, ISO 8601 and numeric codes",b:"PostToolUse normaliza antes de o modelo ver."},
{id:"r15",t:"1.5",f:"Block refunds above $500",b:"Interceptar a chamada de saída (PreToolUse), bloquear e redirecionar para escalonamento."},
{id:"r16",t:"1.6",f:"Fixed multi-aspect review vs open-ended investigation",b:"Chaining para o previsível. Decomposição dinâmica para o aberto."},
{id:"r17",t:"1.7",f:"--resume vs fork_session vs fresh session",b:"Resume: contexto válido (avise o que mudou). Fork: comparar abordagens da mesma base. Nova + resumo: tool results velhos."},
{id:"r18",t:"2.1",f:"Model picks the wrong one of two similar tools",b:"Primeiro passo: descrições ricas (input, exemplos, edge cases, quando usar a outra)."},
{id:"r19",t:"2.1",f:"Two tools overlap in purpose",b:"Renomeie e reescreva, ou divida a genérica em tools com contrato claro."},
{id:"r20",t:"2.1",f:"Good descriptions, misrouting started after a prompt change",b:"Instrução sensível a keyword no system prompt."},
{id:"r21",t:"2.2",f:"How an MCP tool reports failure",b:"isError: true + errorCategory (transient, validation, business, permission), isRetryable, mensagem legível."},
{id:"r22",t:"2.2",f:"Timeout vs zero results",b:"Falha de acesso não é vazio válido. Reporte de forma diferente."},
{id:"r23",t:"2.3",f:"Agent with 18 tools picks badly",b:"4 a 5 tools por papel. Cross-role só para necessidade frequente e simples."},
{id:"r24",t:"2.3",f:"Generic fetch_url used outside the agent's role",b:"Troque por tool restrita (load_document que valida URL de documento)."},
{id:"r25",t:"2.3",f:"tool_choice: auto, any, tool",b:"auto: pode responder texto. any: precisa chamar alguma. tool + name: precisa chamar aquela."},
{id:"r26",t:"2.4",f:"Team MCP server vs personal server",b:".mcp.json no projeto com ${VAR}. Pessoal em ~/.claude.json."},
{id:"r27",t:"2.4",f:"Too many exploratory calls to learn what data exists",b:"MCP resources como catálogo (schemas, docs, issues)."},
{id:"r28",t:"2.4",f:"Agent prefers Grep over a stronger MCP tool",b:"Melhore a descrição da tool MCP: capacidade e saída."},
{id:"r29",t:"2.4",f:"Need Jira integration",b:"Servidor da comunidade. Custom só para fluxo específico do time."},
{id:"r30",t:"2.5",f:"Grep vs Glob",b:"Grep = conteúdo. Glob = caminho e nome."},
{id:"r31",t:"2.5",f:"Edit fails: anchor text is not unique",b:"Read + Write."},
{id:"r32",t:"3.1",f:"New teammate doesn't get the instructions",b:"Estão em ~/.claude/CLAUDE.md. Mova para o CLAUDE.md do projeto."},
{id:"r33",t:"3.1",f:"Which memory files are loaded?",b:"/memory"},
{id:"r34",t:"3.1",f:"Huge monolithic CLAUDE.md",b:"@import por pacote e .claude/rules/ por tema."},
{id:"r35",t:"3.2",f:"Team slash command vs personal",b:".claude/commands/ (git) vs ~/.claude/commands/"},
{id:"r36",t:"3.2",f:"Skill frontmatter: isolate, restrict, ask for a parameter",b:"context: fork, allowed-tools, argument-hint"},
{id:"r37",t:"3.2",f:"Skill or CLAUDE.md?",b:"Skill: sob demanda, fluxo específico. CLAUDE.md: sempre carregado, padrão universal."},
{id:"r38",t:"3.3",f:"Convention for files spread across the repo (tests)",b:".claude/rules/*.md com paths: [\"**/*.test.tsx\"]"},
{id:"r39",t:"3.4",f:"Plan mode or direct execution?",b:"Plan: arquitetura, muitos arquivos, várias abordagens. Direct: escopo claro, um arquivo."},
{id:"r40",t:"3.4",f:"Discovery output floods the context",b:"Explore subagent devolve resumo."},
{id:"r41",t:"3.5",f:"Prose spec is interpreted inconsistently",b:"2 a 3 exemplos concretos de input e output."},
{id:"r42",t:"3.5",f:"Implementing in an unfamiliar domain",b:"Interview pattern: o Claude pergunta antes."},
{id:"r43",t:"3.5",f:"Several bugs: one message or one at a time?",b:"Interagem: uma mensagem. Independentes: sequencial."},
{id:"r44",t:"3.6",f:"CI job hangs waiting for input",b:"claude -p (ou --print)"},
{id:"r45",t:"3.6",f:"Machine-readable findings for inline PR comments",b:"--output-format json + --json-schema"},
{id:"r46",t:"3.6",f:"Same comments reposted after each commit",b:"Passe os achados anteriores; reporte só novos ou não resolvidos."},
{id:"r47",t:"4.1",f:"Too many false positives",b:"Critério explícito do que reportar e do que ignorar. Nunca \"seja conservador\"."},
{id:"r48",t:"4.1",f:"One noisy category kills trust in the rest",b:"Desligue temporariamente, melhore o critério, religue."},
{id:"r49",t:"4.2",f:"Detailed instructions, output still inconsistent",b:"Few-shot: 2 a 4 casos ambíguos com o porquê da escolha."},
{id:"r50",t:"4.3",f:"Guaranteed schema-compliant JSON",b:"tool_use + input_schema. Some com erro de sintaxe, não com erro semântico."},
{id:"r51",t:"4.3",f:"Model invents values for missing fields",b:"Campo nullable ou opcional."},
{id:"r52",t:"4.3",f:"Category list keeps growing",b:"enum + \"other\" com campo de detalhe; \"unclear\" para o ambíguo."},
{id:"r53",t:"4.4",f:"What goes into a retry?",b:"Documento original + extração que falhou + erro de validação específico."},
{id:"r54",t:"4.4",f:"When retry cannot help",b:"Quando a informação não está na fonte enviada."},
{id:"r55",t:"4.5",f:"Message Batches API in one breath",b:"50% mais barato, até 24h, sem SLA, sem tool calling multi-turn, custom_id."},
{id:"r56",t:"4.5",f:"Blocking pre-merge check on batch?",b:"Não. Síncrono. Batch é para noturno e semanal."},
{id:"r57",t:"4.6",f:"Large PR review is inconsistent",b:"Pass por arquivo + pass de integração. Janela maior não resolve."},
{id:"r58",t:"4.6",f:"Same session reviews its own code",b:"Use instância independente, sem o contexto da geração."},
{id:"r59",t:"5.1",f:"Long chat loses amounts and dates",b:"Bloco \"case facts\" persistente, fora do resumo."},
{id:"r60",t:"5.1",f:"Findings in the middle of a long input get dropped",b:"Resumo no início + seções com cabeçalho."},
{id:"r61",t:"5.2",f:"\"I want a human\"",b:"Escale na hora."},
{id:"r62",t:"5.2",f:"Policy is silent on the request",b:"Escale."},
{id:"r63",t:"5.2",f:"Lookup returns several customers",b:"Peça outro identificador. Nunca escolha por heurística."},
{id:"r64",t:"5.2",f:"Sentiment or self-reported confidence as escalation trigger",b:"Proxy ruim. Use critérios explícitos com few-shot."},
{id:"r65",t:"5.3",f:"Subagent timeout: what goes back to the coordinator?",b:"Tipo de falha, query tentada, resultado parcial, alternativas."},
{id:"r66",t:"5.4",f:"Long exploration starts giving generic answers",b:"Scratchpad, subagents, /compact, resumo por fase."},
{id:"r67",t:"5.4",f:"Multi-agent crash recovery",b:"Estado exportado por agente + manifest carregado no resume."},
{id:"r68",t:"5.5",f:"97% overall accuracy: remove human review?",b:"Antes, acurácia por tipo de documento e por campo."},
{id:"r69",t:"5.5",f:"Keep measuring errors after automating",b:"Amostragem aleatória estratificada das de alta confiança."},
{id:"r70",t:"5.6",f:"Two credible sources disagree",b:"Mantenha os dois com fonte e marque o conflito."},
{id:"r71",t:"5.6",f:"Looks like a contradiction, but the data is from different years",b:"Exija data de publicação ou de coleta na saída."}
];

/* Famílias de distratores */
const TRAPS = {
prompt:{n:"Prompt onde precisava de garantia",d:"A regra não pode falhar (dinheiro, compliance, ordem obrigatória) e a opção mexe só no prompt ou em few-shot. Procure hook, gate ou tool_choice forçado."},
over:{n:"Over-engineering",d:"Classificador, modelo treinado, roteador por keyword ou infra nova quando uma descrição ou um critério resolve a causa. A prova quer o primeiro passo proporcional."},
proxy:{n:"Proxy não confiável",d:"Sentimento, confiança autodeclarada sem calibração, keyword, \"só alta confiança\". Não medem complexidade nem correção."},
brute:{n:"Força bruta",d:"Janela maior, modelo maior, mais retries, mais resultados, votação entre execuções. Não ataca a causa (atenção, contexto, critério)."},
hide:{n:"Esconder ou explodir o erro",d:"Vazio marcado como sucesso, status genérico, omissão silenciosa, ou derrubar o workflow inteiro. O certo é erro estruturado com o parcial."},
blame:{n:"Culpar o componente errado",d:"Os logs mostram a causa a montante (coordinator) e a opção mexe nos subagents que fizeram exatamente o que foi pedido."},
fake:{n:"Mecanismo inventado ou trocado",d:"Flag, variável ou arquivo que não existe (--batch, CLAUDE_HEADLESS, .claude/config.json), ou mecanismo real usado para outra coisa."},
scope:{n:"Escopo errado",d:"Coisa do time no nível user (~/.claude) ou coisa pessoal no repo."},
burden:{n:"Empurrar o trabalho",d:"Pedir ao dev, ao cliente ou ao humano o que o sistema deveria fazer (dividir PR, uma conversa por assunto, colar transcript)."},
priv:{n:"Privilégio demais",d:"Dar todas as tools a um agente. O certo é escopo por papel e tool restrita."}
};

const EXAM = {
start:"2026-11-27T23:15:00-03:00",
facts:[
["60 itens","120 min"],["4 de 6","cenários sorteados"],["720 / 1.000","corte em escala"],["OnVUE","inglês (ENU)"]],
risk:"A prova está marcada para sex 27/11 às 23:15, depois de um dia cheio e no seu horário de dormir. O Simulado 1 (sáb 21/11, 23:15) é o teste: se a nota cair muito em relação aos treinos de dia, reagende para um horário de pico. Decida até dom 22/11; o prazo da Pearson é 24h antes da prova.",
check:[
{id:"c1",txt:"System test do OnVUE no mesmo computador, rede e cômodo da prova (até qua 25/11)"},
{id:"c2",txt:"Computador pessoal, sem VPN, proxy ou agente de segurança corporativo"},
{id:"c3",txt:"Documento oficial com foto, válido, com o nome idêntico ao do registro"},
{id:"c4",txt:"Mesa limpa: sem papel, sem segundo monitor ligado, sem smartwatch, sem fone"},
{id:"c5",txt:"Cômodo fechado e silencioso, sem ninguém entrando até ~01:30"},
{id:"c6",txt:"Celular só para as fotos do check-in, depois fora do alcance"},
{id:"c7",txt:"Atualizações do sistema feitas antes de sexta"},
{id:"c8",txt:"Decisão sobre o horário tomada até dom 22/11"}],
proto:[
["13:20","20 min de cards marcados Revisar. Nada de conteúdo novo."],
["18:00","Computador da prova ligado e atualizado. Nenhum update perto da hora."],
["21:30","Jantar feito, notificações desligadas, casa avisada."],
["22:15","Ambiente pronto: confira o checklist."],
["22:45","Check-in no OnVUE (abre 30 min antes)."],
["23:15","Prova: 120 min de questões, até ~01:30 com a abertura."]],
during:[
"Ritmo: 2 min por questão. Passou de 3 min: marque para revisão, escolha a melhor e siga.",
"O cenário abre um bloco de questões. Leia o contexto uma vez, com calma.",
"Item de múltipla resposta diz quantas marcar. Conte antes de confirmar.",
"Elimine pelos padrões de distratores antes de escolher.",
"Responda pelo guia oficial, mesmo que a doc atual tenha mudado.",
"Leia em silêncio. No OnVUE, falar ou murmurar pode gerar alerta do proctor.",
"Não deixe nenhuma em branco."],
planB:"Não passou: retake após 14 dias (a partir de 11/12), com nova taxa. O relatório por domínio vira o plano da segunda tentativa."
};

const RES = [
{n:"cert-study-kit (gratuito)",u:"https://github.com/alexiocassanifm/anthropic-certifications",d:"90 questões originais, wiki por task statement e /mock-exam de 60 itens com relatório por domínio. Roda no Claude Code, o que já é treino do Domínio 3."},
{n:"Tutorials Dojo CCA-F",u:"https://portal.tutorialsdojo.com/product/claude-certified-architect-foundations-cca-f-practice-exams/",d:"Mesmo formato que você usou no AWS: timed, review e por seção. Bom para o Simulado 2."},
{n:"claudecertifiedarchitects.com",u:"https://www.claudecertifiedarchitects.com/?startTest=quick",d:"10 questões grátis. A descrição de domínios do site diverge do guia oficial; use só como extra."}
];

return {DOMAINS,SCEN,TASKS,LESSONS,SPECIAL,PLAN,CARDS,TRAPS,EXAM,RES};
})();
