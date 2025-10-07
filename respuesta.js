document.getElementById('submitBtn').addEventListener('click', async function() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const studentName = document.getElementById('studentName').value.trim();

    // Validación: no enviar si no hay nombre
    if(!studentName){
        alert("⚠️ Por favor, ingrese su nombre antes de enviar.");
        return; // detener ejecución
    }

    const questions = [
        { q: "1. ¿Qué se entiende por costo de software?", name: "q1", correct: "b" },
        { q: "2. ¿Qué representa el modelo COCOMO II?", name: "q3", correct: "c" },
        { q: "3. ¿Qué mide el concepto de “Punto Función”?", name: "q4", correct: "b" },
        { q: "4. ¿Qué estrategia ayuda a optimizar los costos de desarrollo?", name: "q5", correct: "c" },
        { q: "5. El costo del software debe considerarse un gasto y no una inversión.", name: "q6", correct: "falso" }
    ];

    const fecha = new Date().toLocaleString();
    let score = 0;
    const dataToSend = { "Nombre y Apellido": studentName, "Puntaje": 0 };

    // Márgenes y ancho seguro
    const leftMargin = 10;
    const rightMargin = 190;
    const lineWidth = rightMargin - leftMargin - 10; // margen seguro

    // Cabecera PDF
    doc.setFontSize(15);
    doc.text("INSTITUTO TECNOLÓGICO SUPERIOR MECAPACA", 105, 15, null, null, "center");
    doc.setFontSize(13);
    doc.text("CARRERA: SISTEMAS INFORMÁTICOS", 105, 25, null, null, "center");
    doc.text("Cuestionario de Costo de Software", 105, 35, null, null, "center");

    doc.setFontSize(10); // Fuente más pequeña para que quepa
    doc.text(`Nombre del estudiante: ${studentName}`, leftMargin, 50);
    doc.text(`Fecha: ${fecha}`, 150, 50);

    let y = 60;
    const pageHeight = doc.internal.pageSize.height;

    questions.forEach((item) => {
        const selected = document.querySelector(`input[name="${item.name}"]:checked`);
        const answerValue = selected ? selected.value : "No respondida";
        let fullText = selected ? selected.nextSibling.textContent.trim() : "No respondida";
        fullText = fullText.replace(/[\u0000-\u001F\u007F-\u009F&]/g,""); // limpiar caracteres raros

        dataToSend[item.name] = answerValue;

        let punto = 0;
        let correctAnswer = item.correct.toLowerCase();
        if(answerValue.toLowerCase() === correctAnswer) punto = 1;
        score += punto;

        // Pregunta
        doc.setFont(undefined, "bold");
        let questionLines = doc.splitTextToSize(item.q, lineWidth);
        questionLines.forEach(line => {
            doc.text(line, leftMargin, y);
            y += 6;
            if(y > pageHeight - 20){
                doc.addPage();
                y = 20;
            }
        });

        // Opciones con iconos y colores
        const options = Array.from(document.querySelectorAll(`input[name="${item.name}"]`)).map(opt => {
            const enciso = opt.value;
            let text = opt.nextSibling.textContent.trim().replace(/[\u0000-\u001F\u007F-\u009F&]/g,"");
            let icon = opt.checked ? "☑" : "☐";
            let color = [0,0,0];
            if(enciso.toLowerCase() === correctAnswer) color = [0,128,0];
            if(opt.checked && enciso.toLowerCase() !== correctAnswer) color = [255,0,0];
            return { text: `${icon} ${text}`, color: color };
        });

        options.forEach(opt => {
            doc.setTextColor(...opt.color);
            let lines = doc.splitTextToSize(opt.text, lineWidth);
            lines.forEach(line => {
                doc.text(line, leftMargin + 5, y);
                y += 6;
                if(y > pageHeight - 20){
                    doc.addPage();
                    y = 20;
                }
            });
        });

        doc.setTextColor(0,0,0);
        doc.text(`Puntaje: ${punto} / 1`, rightMargin - 25, y - 6);
        y += 5;
    });

    doc.text(`Puntaje total: ${score} / ${questions.length}`, leftMargin, y);

    dataToSend["Puntaje"] = score;

    // Guardar PDF
    doc.save(`Respuestas_${studentName}.pdf`);

    // Guardar en Google Sheet via SheetBest
    const urlSheetBest = "https://api.sheetbest.com/sheets/9ea17350-1af6-4a6f-a79e-fd6f2a1ce42c";

    try {
        const response = await fetch(urlSheetBest, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dataToSend)
        });

        if(response.ok){
            alert("✅ Cuestionario enviado y guardado correctamente.");
        } else {
            alert("❌ Error al guardar los datos en la hoja.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("❌ No se pudo conectar con SheetBest.");
    }
});
