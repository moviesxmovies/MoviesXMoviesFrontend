# 🧦 Sox & Co. - E-Commerce Platform

**Sox & Co.** es una moderna plataforma de comercio electrónico de calcetines premium. Construida con **Vue 3**, **Pinia** y **PrimeVue**, la aplicación implementa un flujo de usuario robusto, desde la navegación anónima hasta el historial de compras persistente.

## 🚀 Puesta en Marcha

Sigue estos pasos para ejecutar el proyecto en tu entorno local:

1. **Instalación de dependencias:**
```bash
npm install

```


2. **Entorno de desarrollo (Vite):**
```bash
npm run dev

```


3. **Compilación para producción:**
```bash
npm run build

```


4. **Previsualizar build de producción:**
```bash
npm run preview

```



---

## 💾 Arquitectura de Storage

La aplicación utiliza una estrategia de persistencia híbrida para equilibrar la seguridad de los datos y la comodidad del usuario.

* **DataUsers (`localStorage`):** Nuestra "base de datos" local. Almacena los perfiles de usuario. Las contraseñas se protegen mediante **bcryptjs** (10 salt rounds).
* **ShopSession (`sessionStorage`):** Gestiona la sesión activa bajo la clave `USER`. Al ser volátil, la sesión se cierra automáticamente al finalizar la navegación por seguridad.
* **GuestCartStore (`sessionStorage`):** Carrito temporal para usuarios no identificados. Permite añadir productos sin estar logueado.
* **CartStore (`localStorage`):** Carrito permanente para usuarios logueados. Al hacer login, los productos del `GuestCartStore` se fusionan automáticamente aquí.
* **HistoryPurchased (`localStorage`):** Repositorio inmutable que guarda el historial de pedidos finalizados (fecha, productos y totales).

---

## 🏗️ Modelos de Datos (TypeScript)

El proyecto está estrictamente tipado para asegurar la integridad de los datos en toda la aplicación:

* **`User`**: Perfil de usuario (`username`, `email`, `password`).
* **`Product`**: Definición del catálogo (ID, nombre, precio, stock, descripción, imagen).
* **`CartProduct`**: Vínculo entre un producto y la cantidad elegida.
* **`Purchase`**: Estructura de historial con marca de tiempo ISO.

---

## 🛠️ Lógica de Negocio Destacada

### **1. Gestión de Carrito e Impuestos**

El `CartStore` centraliza los cálculos financieros de forma reactiva. Se aplica automáticamente un **7% de IGIC** sobre el subtotal.


### **2. Flujo de Pago y Stock**

Al confirmar un pedido en `CartView`:

1. Se genera un registro en `HistoryPurchased`.
2. Se **resta el stock** de los productos en el estado global.
3. Se vacía el carrito del usuario.

### **3. Validación con Zod**

Tanto en el registro como en el login, se aplican reglas de validación en tiempo real (longitud de contraseña, caracteres especiales, formato de email), mejorando la seguridad y la experiencia de usuario.

---

## 🎨 Tecnologías y UI/UX

* **Framework:** Vue 3 (Composition API) + Vite.
* **UI Components:** [PrimeVue](https://primevue.org/) con tema **Material**.
* **Diseño:** *Dark mode* con efectos de desenfoque (`backdrop-blur`) y animaciones fluidas.
* **Navegación:** Vue Router con protección manual en la vista de historial.
