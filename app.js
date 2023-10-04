const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const path = require('path');


const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/generate-pdf', async (req, res) => {
    const pdfName = req.body.pdfName;
    const transporteur = req.body.transporteur;
    const immatriculation = req.body.immatriculation;
    const client = req.body.client;
    const nettoyageVannes = req.body.nettoyageVannes;
    const nettoyageFlexibles = req.body.nettoyageFlexibles;
    const citerneType = req.body.citerneType;
    const materiauTransporte = req.body.materiauTransporte;
    const autreFournisseurText = req.body.autreFournisseurText;
    const granulometrie = req.body.granulometrie;
    const transporteurNom = req.body.transporteurNom;
    const transporteurRepresentant = req.body.transporteurRepresentant;
    const transporteurDateRinxent = req.body.transporteurDateRinxent;
    const dateNettoyage = req.body.dateNettoyage;
    const procede = req.body.procede;

    const procedeLabels = {
        A: "A (nettoyage à sec: brosse, air comprimé)",
        B: "B (nettoyage à l'eau)",
        C: "C (nettoyage à l'eau et détergent)",
        D: "D (nettoyage à l'eau, détergent et désinfectant)"
    };

    const procedeValue = procedeLabels[procede] || '';

    const pdfPath = path.join(__dirname, 'pdfs', `${pdfName}.pdf`);

    // Vérifiez si le fichier existe
    if (fs.existsSync(pdfPath)) {
        // Gérez le cas où le fichier existe en renvoyant une erreur
        res.status(400).send('Le fichier existe déjà');
    } else {
        const pdf = new PDFDocument();
        pdf.pipe(fs.createWriteStream(pdfPath));

        const logoPath = path.join(__dirname, 'logo.png');
        pdf.image(logoPath, 450, 30, { width: 80 });

        // Ajoutez les éléments HTML supplémentaires au PDF
        pdf
            .fontSize(14)
            .text('Carrières de la Vallée Heureuse', { align: 'center' })
            .text('Hydrequent - 62720 RINXENT', { align: 'center' })
            .moveDown(2)
            .fontSize(18)
            .text('ATTESTATION DE PROPRETE', { align: 'center' })
            .moveDown(2)
            .fontSize(12)
            .text(`Transporteur : ${transporteur}`)
            .text(`N° d'immatriculation : ${immatriculation}`)
            .text(`Nom du client : ${client}`)
            .text(`Type de citerne : ${citerneType}`)
            .moveDown(1)
            .text(`Date et heure du dernier nettoyage : ${dateNettoyage}`);

        pdf.text(`Procédé utilisé : ${procedeValue}`);

        // Si "Matériau transporté avant dernier nettoyage" est "Autre Fournisseur", ajoutez le texte supplémentaire
        if (materiauTransporte === 'Autre Fournisseur') {
            pdf.text(`Autre fournisseur : ${autreFournisseurText}`);
        }

        pdf.text(`Nettoyage des vannes de déchargement : ${nettoyageVannes}`)
            .text(`Nettoyage des flexibles de déchargement : ${nettoyageFlexibles}`)
            .moveDown(1)
            .text(`Matériau transporté avant dernier nettoyage : ${materiauTransporte}`)
            .text(`Granulométrie enlevée à CVH : ${granulometrie}`)
            .moveDown(2)
            .text(`Attestation du transporteur:`)
            .text(`Je soussigné(e) ${transporteurNom} représentant les transports ${transporteurRepresentant} certifie que les renseignements portés ci-dessus sont exacts, et engage ma responsabilité en cas de pollution, au cours du transport, des matériaux enlevés aux Carrières de la Vallée Heureuse.`)
            .moveDown(1)
            .text(`A Rinxent, le ${transporteurDateRinxent}`);

       

        pdf.end();

        // Téléchargez le fichier PDF s'il a été créé avec succès
        res.setHeader('Content-disposition', `attachment; filename=${pdfName}.pdf`);
        res.setHeader('Content-type', 'application/pdf');
        const fileStream = fs.createReadStream(pdfPath);
        fileStream.pipe(res);
    }
});



app.listen(port, () => {
    console.log(`Le serveur est en cours d'exécution sur le port ${port}`);
});
