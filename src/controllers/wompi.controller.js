const crypto = require('crypto');
const referencias = {}; // memoria temporal

exports.generarCheckout = async (req, res) => {
  try {
    const { total } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    const amountInCents = Math.round(total * 100);
    const reference     = `FERRE_${Date.now()}`;

    // Guardar token asociado a la referencia
    referencias[reference] = token;

    const signature = crypto
      .createHash('sha256')
      .update(`${reference}${amountInCents}COP${process.env.WOMPI_INTEGRITY_SECRET}`)
      .digest('hex');

    res.json({
      publicKey:     process.env.WOMPI_PUBLIC_KEY,
      amountInCents,
      reference,
      signature,
      redirectUrl:   process.env.WOMPI_REDIRECT_URL
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creando checkout' });
  }
};

exports.obtenerToken = (reference) => referencias[reference];