### Guion de Presentación

---

#### 1. ¿Qué es MotoSegura?

MotoSegura es una “tarjeta médica digital” avanzada que vive en tu celular y en la nube. Permite almacenar de forma segura tu tipo de sangre, alergias, enfermedades, medicamentos y contactos de emergencia. Si sufres un accidente, cualquier persona puede escanear tu código QR y acceder a tu información vital al instante, sin instalar apps ni crear cuentas. Todo el sistema está diseñado para ser rápido, seguro y accesible desde cualquier dispositivo.

---

#### 2. Pasos para construirlo (explicación detallada)

1. **Detectar el problema real**
   * Observamos que muchos motociclistas no llevan información médica accesible en caso de emergencia, lo que puede retrasar la atención y poner vidas en riesgo.
2. **Diseño y prototipado**
   * Realizamos prototipos en papel y herramientas digitales, definiendo la experiencia de usuario y los flujos de interacción. Se priorizó la simplicidad y la rapidez de acceso.
3. **División en arquitectura cliente-servidor**
   * **Frontend (cliente):** Desarrollado en **React.js**, permite una experiencia interactiva, responsiva y moderna. Utiliza componentes reutilizables y maneja el estado global con contextos para autenticación y datos médicos.
   * **Backend (servidor):** Construido con **Flask** (Python), expone una **API RESTful** que gestiona la autenticación, la lógica de negocio, la generación de códigos QR y la persistencia de datos. Se implementan endpoints seguros y bien documentados.
4. **Persistencia de datos**
   * Se utilizó **SQLite** para desarrollo y pruebas rápidas, y **PostgreSQL** para producción, garantizando integridad, velocidad y escalabilidad de la información médica y de usuarios.
5. **Generación y gestión de QR**
   * El backend genera códigos QR únicos y seguros en tiempo real, vinculados a cada usuario. Estos QR pueden imprimirse y adherirse al casco o la moto, permitiendo acceso inmediato a la información vital.
6. **Pruebas exhaustivas y control de calidad**
   * Se realizaron pruebas en dispositivos de diferentes gamas, navegadores y condiciones de red. Se simularon escenarios de emergencia para validar la robustez y facilidad de uso.
7. **Despliegue e infraestructura**
   * El sistema se ejecuta en una **Raspberry Pi 5** usando contenedores **Docker** para aislar y facilitar el despliegue. El acceso externo se habilita mediante **Cloudflare Tunnel**, asegurando conexiones cifradas y seguras desde cualquier lugar.
8. **Automatización y respaldo**
   * Scripts en **Bash** automatizan respaldos cifrados, restauración y despliegue continuo, minimizando riesgos de pérdida de datos y facilitando la recuperación ante fallos.
9. **Optimización y soporte GenAI**
   * Se utilizó **OpenAI** y otras herramientas de GenAI para acelerar el desarrollo, generar código, documentar, validar buenas prácticas y resolver problemas técnicos complejos.

---

#### 3. ¿Cómo lo usa un motociclista? (flujo detallado)

1. **Registro sencillo** – El usuario ingresa sus datos médicos y de contacto en un formulario intuitivo. El sistema valida la información y genera un perfil seguro.
2. **Generación e impresión del QR** – Al completar el registro, se genera un código QR personalizado. El usuario puede descargarlo e imprimirlo en etiquetas resistentes para pegar en su casco o moto.
3. **Acceso en caso de emergencia** – Si ocurre un accidente, cualquier persona puede escanear el QR con su celular y acceder a la información médica crítica, sin necesidad de instalar apps ni registrarse.
4. **Actualización de datos** – El usuario puede ingresar a su perfil con contraseña y token seguro para modificar o actualizar su información. El QR sigue funcionando sin necesidad de reimprimirlo.

---

#### 4. Seguridad explicada (más técnica)

* **Rate limiting y protección anti-abuso:** El backend limita la cantidad de peticiones por usuario/IP para evitar ataques de fuerza bruta y denegación de servicio.
* **Autenticación robusta:** Se usan contraseñas cifradas y tokens JWT para asegurar que solo el dueño pueda modificar su información.
* **Validación y sanitización de datos:** Todos los datos recibidos pasan por filtros estrictos para evitar inyecciones de código o datos maliciosos.
* **Respaldos automáticos y cifrados:** Cada noche, un script realiza un respaldo cifrado de la base de datos, almacenándolo en un lugar seguro para garantizar la recuperación ante fallos.
* **Canales cifrados:** Todo el tráfico entre cliente y servidor viaja por HTTPS, asegurando la privacidad y protección de los datos.

---

#### 5. Presupuesto total (con desglose y justificación)

| Concepto                          |                        Costo (MXN) | Fuente                |
| --------------------------------- | ---------------------------------: | --------------------- |
| Dominio .com.mx (1 año)           |                          **$ 40**  | dato dado             |
| Raspberry Pi 4 (4 GB)             |                       **$ 1 738**  | ([Amazon México][1])  |
| Memoria micro-SD 32 GB            |                         **$ 132**  | ([Mercado Libre][2])  |
| Fuente oficial 27 W               |                         **$ 449**  | ([Mercado Libre][3])  |
| Gabinete con ventilador           |                         **$ 296**  | ([Mercado Libre][4])  |
| 100 etiquetas de vinil 5 cm       |                         **$ 214**  | ([Mercado Libre][5])  |
| Electricidad 1 año (5 W las 24 h) | **$ 47** (44 kWh × $1.063 / kWh)   | ([PRECIOS MÉXICO][6]) |
| Misceláneos (cables, respaldo SD) |                         **$ 200**  | estimado              |
| **Total aproximado**              |                       **$ 3 116**  | —                     |

*Los precios son de mayo 2025 y pueden variar. Cada componente fue elegido por su balance entre costo, eficiencia y confiabilidad para un sistema 24/7.*

---

#### 6. Próximos pasos (visión técnica y de impacto)

* Realizar pruebas piloto con paramédicos y cuerpos de emergencia para obtener retroalimentación real y mejorar la experiencia de uso en situaciones críticas.
* Integrar tecnología **NFC** para que la información médica pueda leerse con solo acercar el casco al teléfono, sin necesidad de escanear el QR.
* Desarrollar una app móvil complementaria para notificaciones y gestión avanzada de perfiles.
* Explorar integración con sistemas de salud y emergencias locales para alertas automáticas.

---

#### 7. ¿Cómo funciona MotoSegura por dentro? (alto nivel técnico, versión extendida y llamativa)

MotoSegura es como una orquesta digital donde cada instrumento cumple una función vital para que todo suene perfecto y seguro. Así es como se compone y funciona:

* **Frontend (cliente):**
  - Imagina una ventanilla digital hecha con **React.js**, donde cada botón y formulario es un músico que responde al ritmo del usuario. Aquí, los componentes reutilizables permiten que la experiencia sea fluida y moderna, como una app profesional.
  - El estado de la aplicación se maneja con precisión, asegurando que los datos del usuario estén siempre sincronizados y protegidos.
  - La comunicación con el backend se realiza mediante **API REST**, usando peticiones HTTP seguras, como si fueran cartas selladas que viajan entre el navegador y el servidor.
  - El frontend incluye manejo de rutas protegidas, notificaciones visuales y validación en tiempo real para mejorar la experiencia y seguridad.

* **Backend (servidor):**
  - El cerebro de MotoSegura está construido con **Flask** (Python), un framework ligero pero poderoso, ideal para crear APIs robustas y seguras.
  - Aquí se orquesta la autenticación, la lógica de negocio, la generación de códigos QR y el acceso a la base de datos. Cada endpoint es como una puerta blindada: solo se abre si tienes la llave correcta (token de acceso).
  - Se implementan medidas de seguridad avanzadas: **rate limiting** para evitar ataques de fuerza bruta, validación estricta de datos y manejo seguro de sesiones.
  - El backend está preparado para escalar y soportar múltiples usuarios concurrentes, con logs detallados y monitoreo de estado.

* **Base de datos:**
  - Los datos médicos y de usuario se almacenan en **SQLite** durante el desarrollo y en **PostgreSQL** en producción, garantizando velocidad y confiabilidad.
  - La estructura de la base de datos está diseñada para ser escalable y resistente, como una bóveda digital, con relaciones bien definidas y respaldo automático.

* **Infraestructura y despliegue:**
  - Todo el sistema vive dentro de un contenedor **Docker**, lo que permite que MotoSegura sea portátil y fácil de desplegar en cualquier lugar, desde una laptop hasta una **Raspberry Pi**.
  - El acceso externo se habilita mediante **Cloudflare Tunnel**, creando un canal seguro y cifrado desde cualquier parte del mundo hasta la mini-PC del proyecto.
  - El despliegue es automatizado y reproducible, facilitando actualizaciones y mantenimiento sin interrumpir el servicio.

* **Automatización y respaldo:**
  - Scripts en **Bash** automatizan tareas críticas como respaldos cifrados, restauración de la base de datos y despliegue continuo. Así, la información está siempre protegida y lista para recuperarse ante cualquier imprevisto.
  - El sistema monitorea el estado de los servicios y alerta ante cualquier anomalía.

* **Código impulsado por GenAI:**
  - Gran parte del código, la documentación y hasta las pruebas fueron apoyadas por herramientas de **GenAI** (principalmente **OpenAI**). Esto permitió acelerar el desarrollo, obtener sugerencias inteligentes, ejemplos de código y explicaciones técnicas en tiempo real.
  - GenAI fue como un copiloto experto, ayudando a escribir funciones complejas, optimizar la seguridad y garantizar buenas prácticas en cada línea de código.

* **Experiencia de usuario y pruebas:**
  - MotoSegura fue probada en múltiples dispositivos, navegadores y condiciones de red, asegurando que funcione incluso en celulares antiguos o con internet lento.
  - El diseño es responsivo y accesible, pensado para que cualquier persona, sin importar su experiencia tecnológica, pueda usarlo fácilmente.
  - Se realizaron pruebas de usabilidad y accesibilidad para garantizar que la solución sea inclusiva y efectiva en situaciones de estrés.

En resumen, MotoSegura es una sinfonía de tecnología moderna, seguridad y automatización, impulsada por inteligencia artificial, todo empaquetado en una solución accesible y lista para salvar vidas.

---

#### 8. Cierre

Con menos de **4 000 pesos** y herramientas que cualquiera puede aprender en la prepa, MotoSegura demuestra que la tecnología sencilla, bien pensada y apoyada por inteligencia artificial puede salvar vidas. ¡Gracias por escuchar y manejar con cuidado!

