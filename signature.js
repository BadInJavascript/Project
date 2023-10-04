const canvas = document.getElementById('signatureCanvas');
const form = document.querySelector('.signature-pad-form');
const clearButton = document.getElementById('clearSignatureButton');

const ctx = canvas.getContext('2d');
let writingMode = false;

document.addEventListener('DOMContentLoaded', () => {
    // Placez ici tout le code JavaScript lié à la signature
    // Cela garantit que le code s'exécute après le chargement complet de la page.

    // Fonction pour effacer la signature
    const clearPad = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // Fonction pour obtenir la position du pointeur
    const getTargetPosition = (event) => {
        const positionX = event.clientX - canvas.getBoundingClientRect().left;
        const positionY = event.clientY - canvas.getBoundingClientRect().top;
        return [positionX, positionY];
    }

    // Gestionnaire d'événement pour le mouvement du pointeur
    const handlePointerMove = (event) => {
        if (!writingMode) return;

        event.preventDefault();

        if (event.touches) {
            // Événement tactile
            for (let i = 0; i < event.touches.length; i++) {
                const touch = event.touches[i];
                const [positionX, positionY] = getTargetPosition(touch);
                ctx.lineTo(positionX, positionY);
            }
        } else {
            // Événement de souris
            const [positionX, positionY] = getTargetPosition(event);
            ctx.lineTo(positionX, positionY);
        }

        ctx.stroke();
    }

    // Gestionnaire d'événement pour le relâchement du pointeur
    const handlePointerUp = () => {
        writingMode = false;
    }

    // Gestionnaire d'événement pour l'appui sur le pointeur
    const handlePointerDown = (event) => {
        writingMode = true;
        ctx.beginPath();
        const [positionX, positionY] = getTargetPosition(event);
        ctx.moveTo(positionX, positionY);
    }

    // Configuration du style de la signature
    ctx.lineWidth = 3;
    ctx.lineJoin = ctx.lineCap = 'round';

    // Écouteurs d'événements pour les actions de signature
    canvas.addEventListener('pointerdown', handlePointerDown, { passive: false });
    canvas.addEventListener('pointerup', handlePointerUp, { passive: false });
    canvas.addEventListener('pointermove', handlePointerMove, { passive: false });

    // Écouteurs d'événements pour les écrans tactiles
    canvas.addEventListener('touchstart', handlePointerDown, { passive: true });
    canvas.addEventListener('touchend', handlePointerUp, { passive: true });
    canvas.addEventListener('touchmove', handlePointerMove, { passive: true });

    // Écouteur d'événement pour le bouton Effacer
    clearButton.addEventListener('click', (event) => {
        event.preventDefault();
        clearPad();
    });

    // Écouteur d'événement lors de la soumission du formulaire
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Obtenir l'image de la signature au format base64
        const imageURL = canvas.toDataURL();

        // Envoyer l'image de la signature au serveur
        const response = await fetch('/upload-signature', {
            method: 'POST',
            body: JSON.stringify({ signature: imageURL }),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            // Si l'image de la signature a été téléchargée avec succès, continuer pour générer le PDF
            const formData = new FormData(form);
            formData.append('signatureImageURL', imageURL);

            // Soumettre le formulaire avec l'image de la signature
            const pdfResponse = await fetch('/generate-pdf', {
                method: 'POST',
                body: formData,
            });

            if (pdfResponse.ok) {
                // Si le PDF a été généré avec succès, téléchargez-le ou effectuez toute autre action requise
                // (Assurez-vous que votre serveur renvoie le PDF correctement)
                const pdfBlob = await pdfResponse.blob();
                const pdfUrl = window.URL.createObjectURL(pdfBlob);

                // Créez un lien pour télécharger le PDF généré
                const downloadLink = document.createElement('a');
                downloadLink.href = pdfUrl;
                downloadLink.download = 'formulaire.pdf';
                downloadLink.style.display = 'none';
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
            } else {
                console.error('Erreur lors de la génération du PDF');
            }
        } else {
            console.error('Erreur lors du téléchargement de l\'image de la signature');
        }
    });
});
