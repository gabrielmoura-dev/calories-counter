# 🔢 Calories Counter

Aplicação web para rastreamento de calorias e informações nutricionais, consumindo a API da [Nutritionix](https://www.nutritionix.com/business/api). Pesquise qualquer alimento e obtenha dados nutricionais detalhados em tempo real.

🔗 **[Acesse a aplicação](https://gabrielmoura-dev.github.io/calories-counter)**

---

## ✨ Funcionalidades

- Busca de alimentos via API da Nutritionix (banco de dados nutricional dos EUA)
- Exibição de calorias, macronutrientes e informações detalhadas
- Gerenciamento de estado global com Zustand
- Interface responsiva com Tailwind CSS
- Suporte a PWA (Progressive Web App) - instalável no celular

---

## 🛠️ Tecnologias

<div align="center">

![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite_8-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-443E38?style=for-the-badge&logo=react&logoColor=white)

</div>

---

## 🚀 Como rodar localmente

### Pré-requisitos

- [Node.js](https://nodejs.org/) (v18+)
- Uma conta gratuita na [Nutritionix API](https://www.nutritionix.com/business/api) para obter `APP_ID` e `APP_KEY`

### Instalação

```bash
# Clone o repositório
git clone https://github.com/gabrielmoura-dev/calories-counter.git
cd calories-counter

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais da Nutritionix

# Rode o projeto
npm run dev
```

---

## 📁 Estrutura do Projeto

```
calories-counter/
├── public/             # Arquivos estáticos
├── src/                # Código-fonte
├── .env.example        # Template de variáveis de ambiente
├── index.html          # Entry point HTML
├── vite.config.ts      # Configuração do Vite + PWA
├── tsconfig.json       # Configuração do TypeScript
└── package.json
```

---

## 🔑 Variáveis de Ambiente

| Variável | Descrição |
|----------|-----------|
| `VITE_NUTRITIONIX_APP_ID` | App ID da API Nutritionix |
| `VITE_NUTRITIONIX_APP_KEY` | App Key da API Nutritionix |

Crie uma conta gratuita em [nutritionix.com/business/api](https://www.nutritionix.com/business/api) para obter suas credenciais.

---

## 📝 Licença

Este projeto é de uso pessoal/educacional.

---

<div align="center">

Desenvolvido por [Gabriel Moura](https://github.com/gabrielmoura-dev)

</div>
