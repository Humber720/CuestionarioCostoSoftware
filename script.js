document.getElementById('submitBtn').addEventListener('click', async function() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const studentName = document.getElementById('studentName').value.trim() || "Nombre no ingresado";

    // Definir preguntas y respuestas correctas
    const questions = [
        { q: "1. ¿Qué se entiende por costo de software?", name: "q1", correct: "b) La inversión total para desarrollar, implementar y mantener un programa." },
        { q: "2. ¿Qué representa el modelo COCOMO II?", name: "q3", correct: "c) Un modelo para estimar costo, esfuerzo y duración de proyectos de software" },
        { q: "3. ¿Qué mide el concepto de “Punto Función”?", name: "q4", correct: "b) El tamaño funcional del software basado en sus funcionalidades" },
        { q: "4. ¿Qué estrategia ayuda a optimizar los costos de desarrollo?", name: "q5", correct: "c) Adoptar metodologías ágiles como Scrum o Kanban" },
        { q: "5. El costo del software debe considerarse un gasto y no una inversión.", name: "q6", correct: "falso" } // valor de la respuesta
    ];

    let y = 20;
    let score = 0;
    doc.setFontSize(14);
    doc.text(`Respuestas del Cuestionario - ${studentName}`, 10, y);
    y += 10;

    questions.forEach((item) => {
        const selected = document.querySelector(`input[name="${item.name}"]:checked`);
        const answer = selected ? selected.value : "No respondida";
        const fullText = selected ? selected.nextSibling.textContent.trim() : "No respondida";

        doc.text(`${item.q}`, 10, y);
        y += 7;
        doc.text(`Respuesta: ${fullText}`, 15, y);
        y += 10;

        // Calcular puntaje
        if(answer.toLowerCase() === item.correct.toLowerCase() || fullText === item.correct){
            score += 1;
        }

        if(y > 270){
            doc.addPage();
            y = 20;
        }
    });

    doc.text(`Puntaje total: ${score} / ${questions.length}`, 10, y);

    // Guardar PDF
    doc.save(`Respuestas_${studentName}.pdf`);

    // Guardar en Google Sheet via SheetBest
    const urlSheetBest = "https://api.sheetbest.com/sheets/48d2338d-5018-406b-b2fd-2e7ce6761d55";
    const data = {
        "Nombre y Apellido": studentName,
        "Puntaje": score
    };

    try {
        const response = await fetch(urlSheetBest, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if(response.ok){
            alert("Datos guardados correctamente en la hoja de cálculo.");
        } else {
            alert("Error al guardar los datos en la hoja.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("No se pudo conectar con SheetBest.");
    }
});
