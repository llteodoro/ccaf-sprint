# CCA-F Sprint (PWA)

App de estudo para a Claude Certified Architect, Foundations. Estático, sem backend e sem build.
Funciona offline depois da primeira abertura. O progresso fica no aparelho (localStorage) e nunca sai dele.

## Publicar no GitHub Pages
1. Crie o repo `ccaf-sprint` e suba o conteúdo desta pasta na raiz, incluindo `.nojekyll`.
2. Settings > Pages > Build and deployment > Deploy from a branch > `main` / `(root)`.
3. Abra `https://<usuario>.github.io/ccaf-sprint/` no Chrome do celular e toque em Instalar.

No plano Free, o Pages exige repo público. Nada pessoal vai junto: o progresso não sai do aparelho.

Funciona em qualquer host estático com HTTPS, como Azure Static Web Apps, Cloudflare Pages ou Netlify.
Os caminhos são relativos, então dá para servir em subpasta.

## Testar localmente
```
python3 -m http.server 8080
```
Abra http://localhost:8080. Para service worker, localhost conta como contexto seguro.

## Atualizar
Substitua os arquivos e publique. O `sw.js` carrega `VERSION` (hash do conteúdo). Na próxima abertura,
o app mostra "Nova versão pronta" e atualiza com um toque, sem perder progresso.

## Levar o progresso para outro aparelho
Em Status, use Exportar progresso (copiar o código ou baixar o .json). No outro aparelho, use Status > Importar.
A importação junta os dados pelo registro mais recente e não apaga nada.
A geração de questões com IA só roda na versão do claude.ai. As questões geradas lá chegam aqui pelo mesmo Importar.

## Estrutura
- `index.html`: app (UI, lógica, estilos)
- `data-plan.js`: plano, pílulas, cards de decisão, distratores, checklist da prova
- `data-q.js`: banco de questões originais (não são da prova nem do guia oficial)
- `sw.js`, `manifest.webmanifest`, `icons/`, `screenshots/`
- `fonts/`: IBM Plex Sans/Mono e Bricolage Grotesque (SIL OFL 1.1, licenças incluídas)
