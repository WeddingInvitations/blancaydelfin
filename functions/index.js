const functions = require("firebase-functions");
const admin = require("firebase-admin");
const SibApiV3Sdk = require('@sendinblue/client');
const cors = require("cors")({origin: true});

admin.initializeApp();

// Configurar Brevo/Sendinblue
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
const apiKey = apiInstance.authentications['apiKey'];
apiKey.apiKey = "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";

exports.enviarEmail = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    console.log("Iniciando envío de email...");
    console.log("Request body:", JSON.stringify(req.body, null, 2));
    
    const {nm, ph, att, ale, gue, song, size} = req.body; // Agregar song y size aquí

    // Validar datos mínimos necesarios
    if (!nm || !ph) {
      console.warn("Datos incompletos:", req.body);
      return res.status(400).json({message: "Faltan datos obligatorios"});
    }

    let text = `Nombre:${nm}\n`;
    text += `Teléfono:${ph}\n`;
    text += `Alergias:${ale}\n`;

    if (!att) {
      text += `Acompañantes: No voy acompañado\n`;
    } else {
      text += `Acompañantes:\n`;
      gue.forEach((acompanante, index) => {
        text += `\tAcompañante ${index + 1}:\n`;
        text += `\t\tNombre: ${acompanante.Nombre}\n`;
        text += `\t\tTipo de Invitado: ${acompanante.TipoInvitado}\n`;
        text += `\t\tAlergias: ${acompanante.Alergias}\n\n`;
      });
    }

    // if (bus) {
    //   text += `Transporte: Sí, necesito transporte\n`;
    // } else {
    //   text += `Transporte: No necesito transporte\n`;
    // }

    text += `Canción: ${song || 'No especificada'}\n`;
    text += `Talla: ${size || 'No especificada'}\n`;

    const email1 = "angelavargasalba@gmail.com";
    const email2 = "f14agui@gmail.com";

    // Crear el email para Brevo
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.sender = { 
      name: "Blanca y Delfín Wedding",  // Cambiar el nombre
      email: "weddinginvitationscampfire@gmail.com"  // Mantener el mismo email verificado
    };
    sendSmtpEmail.to = [
      { email: email1, name: "Angela" },
      { email: email2, name: "Fernando" }
    ];
    sendSmtpEmail.subject = "Nueva asistencia registrada";
    sendSmtpEmail.textContent = text;

    console.log("Datos del email a enviar:", JSON.stringify(sendSmtpEmail, null, 2));

    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, POST");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    
    try {
      console.log("Intentando enviar email con Brevo...");
      console.log("API Instance:", apiInstance);
      console.log("API Key configurado:", apiKey.apiKey ? "SÍ" : "NO");
      
      // Enviar email con Brevo
      const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log("Email enviado exitosamente:", JSON.stringify(result, null, 2));
      res.status(200).json({message: "Notificación OK", messageId: result.messageId});
    } catch (error) {
      console.error("Error enviando email:", error);
      console.error("Error response:", error.response ? error.response.data : 'No response data');
      console.error("Error status:", error.response ? error.response.status : 'No status');
      res.status(500).json({
        error: "Error enviando notificación", 
        details: error.message,
        brevoError: error.response ? error.response.data : null
      });
    }
  });
});