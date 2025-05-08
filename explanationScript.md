### Guion de Presentación

---

#### 1. ¿Qué es MotoSegura?

MotoSegura es como una “tarjeta médica digital” que vive en tu celular. Guarda tu tipo de sangre, alergias y teléfonos de emergencia. Si te accidentas, alguien escanea tu código QR y ve esos datos al instante, sin instalar nada.

---

#### 2. Pasos para construirlo

1. **Detectar el problema**

   * Muchos motociclistas no llevan su información médica a la mano.
2. **Dibujar la idea**

   * Hicimos bocetos en papel de cómo se verían las pantallas (como si fueran cómics sencillos).
3. **Dividir la app en dos partes fáciles de entender**

   * **Lo que se ve** (pantallas): hecho con un programa llamado **React**, que permite que la página cambie rápido sin recargar.
   * **Lo que trabaja por dentro** (servidor): una pequeña app en **Python** llamada **Flask** que guarda y entrega los datos.
4. **Guardar la info**

   * Al principio usamos una libreta digital sencilla (SQLite). Para uso diario cambiamos a una libreta más fuerte (PostgreSQL).
5. **Generar el QR**

   * Un trozo de código crea tu QR en menos de un segundo.
6. **Probar y corregir**

   * Probamos en celulares viejos y nuevos, con internet lento y rápido.
7. **Ponerlo en línea**

   * Corre en una **Raspberry Pi 5** (una mini-computadora del tamaño de una tarjeta de crédito) en la casa del equipo.
   * Usamos **Cloudflare Tunnel** (plan gratis) para que cualquiera pueda entrar desde internet.

---

#### 3. ¿Cómo lo usa un motociclista?

1. **Registro** – Escribe sus datos y la app genera su QR.
2. **Impresión** – Imprime la etiqueta y la pega en el casco o la moto.
3. **Accidente** – Cualquiera escanea el QR y ve solo la información vital.
4. **Actualización** – Si cambian sus datos, entra con su contraseña y edita; el QR sigue sirviendo.

---

#### 4. Seguridad explicada fácil

* **Límite de peticiones**: evita que alguien “spamee” el servidor.
* **Contraseña + token**: solo el dueño puede cambiar sus datos.
* **Revisión de datos**: la app no deja meter código raro que pueda dañar el sistema.
* **Respaldos diarios**: cada noche se guarda una copia cifrada por si la mini-PC falla.

---

#### 5. Presupuesto total

| Concepto                          |                        Costo (MXN) | Fuente                |
| --------------------------------- | ---------------------------------: | --------------------- |
| Dominio .com.mx (1 año)           |                          **\$ 40** | dato dado             |
| Raspberry Pi 4 (4 GB)             |                       **\$ 1 738** | ([Amazon México][1])  |
| Memoria micro-SD 32 GB            |                         **\$ 132** | ([Mercado Libre][2])  |
| Fuente oficial 27 W               |                         **\$ 449** | ([Mercado Libre][3])  |
| Gabinete con ventilador           |                         **\$ 296** | ([Mercado Libre][4])  |
| 100 etiquetas de vinil 5 cm       |                         **\$ 214** | ([Mercado Libre][5])  |
| Electricidad 1 año (5 W las 24 h) | **\$ 47** (44 kWh × \$1.063 / kWh) | ([PRECIOS MÉXICO][6]) |
| Misceláneos (cables, respaldo SD) |                         **\$ 200** | estimado              |
| **Total aproximado**              |                       **\$ 3 116** | —                     |

*Los precios son de mayo 2025 y pueden variar.*

---

#### 6. Próximos pasos

* Pedir a paramédicos reales que prueben el sistema y den retroalimentación.
* Añadir chip **NFC** para que la información también salga con solo acercar el casco al teléfono.

---

#### 7. Cierre

Con menos de **4 000 pesos** y herramientas que cualquiera puede aprender en la prepa, MotoSegura demuestra que la tecnología sencilla puede salvar vidas. ¡Gracias por escuchar y manejar con cuidado!

