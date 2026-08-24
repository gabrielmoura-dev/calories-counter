# Calories Counter

Aplicativo web para registrar refeições e acompanhar o consumo diário de calorias e macronutrientes (proteína, carboidrato e gordura), com metas diárias configuráveis.

A busca de alimentos é feita combinando uma base local de alimentos comuns com a API pública [USDA FoodData Central](https://fdc.nal.usda.gov/api-guide.html), o banco de dados nutricional do governo dos EUA.

## Funcionalidades

- Busca de alimentos por nome, combinando resultados locais e da USDA FoodData Central
- Busca em português e espanhol: como a USDA FoodData Central só indexa termos em inglês, uma camada de tradução própria (dicionário `TRANSLATIONS` em `src/services/usda.ts`) converte termos comuns em PT/ES para EN antes de consultar a API
- Registro de refeições com porções (gramas ou medidas caseiras)
- Cálculo automático de calorias e macros (proteína, carboidrato, gordura) por refeição e por dia
- Definição de metas diárias de calorias e macronutrientes
- Resumo do dia com progresso em relação às metas

## Pré-requisitos

- Node.js e npm
- Uma conta gratuita na [USDA FoodData Central API](https://fdc.nal.usda.gov/api-guide.html) para obter uma API key (`api.data.gov`)

## Configuração

1. Copie `.env.example` para `.env`
2. Preencha a API key da USDA FoodData Central

### Variáveis de Ambiente

| Variável              | Obrigatória | Descrição                                                                                     |
| ---------------------- | ----------- | ----------------------------------------------------------------------------------------------- |
| `VITE_USDA_API_KEY`    | Sim         | API key da [USDA FoodData Central](https://fdc.nal.usda.gov/api-guide.html), usada para buscar alimentos que não estão na base local |

## Rodando o projeto

```bash
npm install
npm run dev
```

---

Este projeto foi criado a partir do template padrão do Vite (React + TypeScript). Configurações de ESLint e do React Compiler seguem o template original:

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
