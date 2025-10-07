document.getElementById('submitBtn').addEventListener('click', async function() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const studentName = document.getElementById('studentName').value.trim();
    if(!studentName){
        alert("⚠️ Por favor, ingrese su nombre antes de enviar.");
        return;
    }

    // Preguntas con todas las opciones
    const questions = [
        { 
            q: "1. ¿Qué se entiende por costo de software?", 
            name: "q1", 
            options: {
                a: "a) Solo el tiempo de desarrollo",
                b: "b) La inversión total para desarrollar, implementar y mantener un programa.",
                c: "c) Solo el costo de hardware",
                d: "d) Ninguna de las anteriores"
            },
            correct: "b"
        },
        { 
            q: "2. ¿Qué representa el modelo COCOMO II?", 
            name: "q3",
            options: {
                a: "a) Método de prueba de software",
                b: "b) Modelo de programación orientada a objetos",
                c: "c) Un modelo para estimar costo, esfuerzo y duración de proyectos de software",
                d: "d) Plan de mantenimiento"
            },
            correct: "c"
        },
        { 
            q: "3. ¿Qué mide el concepto de “Punto Función”?", 
            name: "q4",
            options: {
                a: "a) Tiempo de desarrollo",
                b: "b) El tamaño funcional del software basado en sus funcionalidades",
                c: "c) Número de líneas de código",
                d: "d) Calidad del software"
            },
            correct: "b"
        },
        { 
            q: "4. ¿Qué estrategia ayuda a optimizar los costos de desarrollo?", 
            name: "q5",
            options: {
                a: "a) Contratar más personal",
                b: "b) Ignorar pruebas",
                c: "c) Adoptar metodologías ágiles como Scrum o Kanban",
                d: "d) Desarrollar sin planificación"
            },
            correct: "c"
        },
        { 
            q: "5. El costo del software debe considerarse un gasto y no una inversión.", 
            name: "q6",
            options: {
                a: "a) Verdadero",
                b: "b) Falso"
            },
            correct: "b"
        }
    ];

    let y = 20;
    const leftMargin = 10;
    const rightMargin = 190;
    const lineWidth = rightMargin - leftMargin - 5;
    const pageHeight = doc.internal.pageSize.height;
    let score = 0;

    // Cabecera
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(`Respuestas del Cuestionario - ${studentName}`, leftMargin, y);
    y += 10;

    questions.forEach(item => {
        const selectedInput = document.querySelector(`input[name="${item.name}"]:checked`);
        const selected = selectedInput ? selectedInput.value : null;

        // Pregunta
        doc.setFont("helvetica", "bold");
        let qLines = doc.splitTextToSize(item.q, lineWidth);
        qLines.forEach(line => {
            doc.text(line, leftMargin, y);
            y += 7;
            if(y > pageHeight - 20){ doc.addPage(); y = 20; }
        });

        // Opciones con colores según si es correcta o seleccionada incorrecta
        Object.keys(item.options).forEach(key => {
            const optionText = item.options[key];
            let color = [0,0,0]; // negro por defecto
            let icon = "☐";

            if(key === item.correct) color = [0,128,0]; // verde correcta
            if(selected === key && key !== item.correct) color = [255,0,0]; // rojo incorrecta
            if(selected === key) icon = key === item.correct ? "☑" : "☒"; // marcado

            doc.setTextColor(...color);
            let lines = doc.splitTextToSize(`${icon} ${optionText}`, lineWidth - 5);
            lines.forEach(line => {
                doc.text(line, leftMargin + 5, y);
                y += 7;
                if(y > pageHeight - 20){ doc.addPage(); y = 20; }
            });
        });

        // Puntaje por pregunta
        const punto = (selected === item.correct) ? 1 : 0;
        score += punto;
        doc.setTextColor(0,0,0);
        doc.setFont("helvetica", "bold");
        doc.text(`Puntaje: ${punto} / 1`, rightMargin - 25, y - 7);
        y += 5;
    });

    // Puntaje total
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0,0,0);
    doc.text(`Puntaje total: ${score} / ${questions.length}`, leftMargin, y);

    // Guardar PDF
    doc.save(`Respuestas_${studentName}.pdf`);

    // Guardar en Google Sheet via SheetBest
    const urlSheetBest = "https://api.sheetbest.com/sheets/48d2338d-5018-406b-b2fd-2e7ce6761d55";
    const data = { "Nombre y Apellido": studentName, "Puntaje": score };
    try {
        const response = await fetch(urlSheetBest, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        if(response.ok) alert("✅ Datos guardados correctamente.");
        else alert("❌ Error al guardar los datos.");
    } catch (error) {
        console.error(error);
        alert("❌ No se pudo conectar con SheetBest.");
    }
});
