document.getElementById('submitBtn').addEventListener('click', async function() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const studentName = document.getElementById('studentName').value.trim();
    if(!studentName){
        alert("⚠️ Por favor, ingrese su nombre antes de enviar.");
        return;
    }

    const questions = [
        { q: "1. ¿Qué se entiende por costo de software?", name: "q1", correct: "b" },
        { q: "2. ¿Qué representa el modelo COCOMO II?", name: "q3", correct: "c" },
        { q: "3. ¿Qué mide el concepto de “Punto Función”?", name: "q4", correct: "b" },
        { q: "4. ¿Qué estrategia ayuda a optimizar los costos de desarrollo?", name: "q5", correct: "c" },
        { q: "5. El costo del software debe considerarse un gasto y no una inversión.", name: "q6", correct: "b" }
    ];

    const fecha = new Date().toLocaleString();
    let score = 0;
    const dataToSend = { "Nombre y Apellido": studentName, "Puntaje": 0 };

    // Márgenes y ancho
    const leftMargin = 10;
    const rightMargin = 200; // mayor ancho
    const lineWidth = rightMargin - leftMargin - 10; 
    const pageHeight = doc.internal.pageSize.height;

    let y = 20;

    // Cabecera centrada y con splitText
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    const headerLines = doc.splitTextToSize("INSTITUTO TECNOLÓGICO SUPERIOR MECAPACA", lineWidth);
    headerLines.forEach(line => {
        doc.text(line, 105, y, { align: "center" });
        y += 7;
    });

    const subHeader1 = doc.splitTextToSize("CARRERA: SISTEMAS INFORMÁTICOS", lineWidth);
    subHeader1.forEach(line => { doc.text(line, 105, y, { align: "center" }); y += 7; });

    const subHeader2 = doc.splitTextToSize("Cuestionario de Costo de Software", lineWidth);
    subHeader2.forEach(line => { doc.text(line, 105, y, { align: "center" }); y += 10; });

    // Datos estudiante
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Nombre del estudiante: ${studentName}`, leftMargin, y);
    doc.text(`Fecha: ${fecha}`, rightMargin - 60, y);
    y += 10;

    questions.forEach(item => {
        const selected = document.querySelector(`input[name="${item.name}"]:checked`);
        const answerValue = selected ? selected.value : "No respondida";
        const fullText = selected ? selected.nextSibling.textContent.trim() : "No respondida";

        dataToSend[item.name] = answerValue;

        const punto = (answerValue.toLowerCase() === item.correct.toLowerCase()) ? 1 : 0;
        score += punto;

        // Pregunta
        doc.setFont("helvetica", "bold");
        const qLines = doc.splitTextToSize(item.q, lineWidth);
        qLines.forEach(line => {
            doc.text(line, leftMargin, y);
            y += 6;
            if(y > pageHeight - 20){ doc.addPage(); y = 20; }
        });

        // Opciones
        const options = Array.from(document.querySelectorAll(`input[name="${item.name}"]`)).map(opt => {
            const enciso = opt.value;
            let text = opt.nextSibling.textContent.trim();
            let icon = opt.checked ? "☑" : "☐";
            let color = [0,0,0]; // negro
            if(enciso.toLowerCase() === item.correct.toLowerCase()) color = [0,128,0]; // verde
            if(opt.checked && enciso.toLowerCase() !== item.correct.toLowerCase()) color = [255,0,0]; // rojo
            return { text: `${icon} ${text}`, color };
        });

        options.forEach(opt => {
            doc.setTextColor(...opt.color);
            const lines = doc.splitTextToSize(opt.text, lineWidth - 5);
            lines.forEach(line => {
                doc.text(line, leftMargin + 5, y);
                y += 6;
                if(y > pageHeight - 20){ doc.addPage(); y = 20; }
            });
        });

        // Puntaje por pregunta
        doc.setTextColor(0,0,0);
        doc.setFont("helvetica", "bold");
        doc.text(`Puntaje: ${punto} / 1`, rightMargin - 25, y - 6);
        y += 5;
    });

    // Puntaje total
    doc.setTextColor(0,0,0);
    doc.setFont("helvetica", "bold");
    doc.text(`Puntaje total: ${score} / ${questions.length}`, leftMargin, y);
    dataToSend["Puntaje"] = score;

    // Guardar PDF
    doc.save(`Respuestas_${studentName}.pdf`);

    // Guardar en SheetBest (puede fallar por CORS en GitHub Pages)
    const urlSheetBest = "https://api.sheetbest.com/sheets/9ea17350-1af6-4a6f-a79e-fd6f2a1ce42c";
    try {
        const response = await fetch(urlSheetBest, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dataToSend)
        });
        if(response.ok) alert("✅ Cuestionario enviado y guardado correctamente.");
        else alert("❌ Error al guardar los datos en la hoja.");
    } catch (error) {
        console.error(error);
        alert("❌ No se pudo conectar con SheetBest.");
    }
});
