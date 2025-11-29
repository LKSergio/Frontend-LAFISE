# Frontend-LAFISE 👩‍💻

Sistema de prueba tecnica frontend para banca en línea de LAFISE construido con Next.js (App Router) y Tailwind CSS, integrando lógica de transferencias internas y a terceros, visualización de cuentas, tarjetas y transacciones recientes.

## Agradecimientos 😃 🙌

Antes que nada, gracias a LAFISE por la oportunidad de participar en este proceso de selección. Agradezco también al ingeniero Angel Blandon por la supervisión, guía y apoyo durante el desarrollo de esta prueba para optar a una pasantia.

## Gestión y ejecución del sistema ⏬

**Paso a Paso:**

- Abrir #1 terminal o PowerShell
- Montar a la ruta cd lafise:
    ```powershell
    cd lafise
    ```
- Instalar dependencias con pnpm:
	```powershell
	pnpm install
	```
- Ejecutar desarrollo:
	```powershell
	pnpm dev
	```
----

- Abrir #2 terminal o PowerShell
- Montar a la ruta de la API mock (si corresponde):
    ```powershell
    cd lafise/lib/API
    ```
- Instalar dependencias de la API mock (si corresponde):
    ```powershell
    npm install
    ```
- Si alguna libreria se instala con vulnerabilidades, ejecutar:
	```powershell
	npm audit fix o npm audit fix --force
	```
- Iniciar mock API (si corresponde):
	```powershell
	npm run start-mock
	```

- Visualizar el sistema abriendo el navegador en la ruta:
	```URL
	http://localhost:3000
	```


**Tecnologías 🛠️**
- **Framework:** Next.js (App Router) sobre React 18
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS, PostCSS
- **Iconos:** lucide-react
- **Imágenes:** next/image
- **Animaciones:** lottie-react
- **Linting/Formato:** ESLint

**Librerías principales 👾**
- `next` / `react` / `react-dom`
- `tailwindcss` / `postcss` / `autoprefixer`
- `lucide-react`
- `lottie-react`

**Gestores de paquetes 📦**
- `pnpm` (preferido por el proyecto)
- `npm` (alternativa compatible)

**Estructura del sistema 📂**

```
LICENSE
README.md
lafise/
	eslint.config.mjs
	next-env.d.ts
	next.config.ts
	package.json
	pnpm-lock.yaml
	postcss.config.mjs
	README.md
	tsconfig.json
	app/
		globals.css
		layout.tsx
		page.tsx
	components/
		accounts.tsx
		credit-cards.tsx
		dashboard-content.tsx
		header.tsx
		main-content.tsx
		my-transactions.tsx
		recent-transactions.tsx
		sidebar.tsx
		transfer-form.tsx
	contexts/
		sidebar-context.tsx
		user-context.tsx (si existe en el workspace)
	lib/
		api-client.ts (cliente de API)
		validation-utils.ts (utilidades de validación)
		API/ (mock API, scripts de inicio)
	public/
		images/
			Cards/
				Background.png
				Logo.png
			sidebar/
				Logo.png
		animation/
			Avatar.json
```