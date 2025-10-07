// ----------------------
// ELEMENTOS Y VARIABLES
// ----------------------
const sendFormBtn = document.getElementById('submitBtn');
const spinner = document.createElement('span');

spinner.style.cssText = `
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 3px solid #ccc;
  border-top-color: #2980b9;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-left: 10px;
  vertical-align: middle;
`;
spinner.style.display = 'none';
sendFormBtn.parentNode.insertBefore(spinner, sendFormBtn.nextSibling);

let datosEnviados = {};
const urlSheetBest = "https://api.sheetbest.com/sheets/9ea17350-1af6-4a6f-a79e-fd6f2a1ce42c";

// ----------------------
// ENVIAR FORMULARIO
// ----------------------
sendFormBtn.addEventListener('click', async function() {
  spinner.style.display = 'inline-block';
  sendFormBtn.disabled = true;

  const studentName = document.getElementById('studentName').value.trim();
  if(!studentName){
    alert("⚠️ Por favor, ingrese su nombre antes de enviar.");
    spinner.style.display = 'none';
    sendFormBtn.disabled = false;
    return;
  }

  const questions = [
    { q: "1. ¿Qué se entiende por costo de software?", name: "q1", correct: "b" },
    { q: "2. ¿Qué representa el modelo COCOMO II?", name: "q3", correct: "c" },
    { q: "3. ¿Qué mide el concepto de “Punto Función”?", name: "q4", correct: "b" },
    { q: "4. ¿Qué estrategia ayuda a optimizar los costos de desarrollo?", name: "q5", correct: "c" },
    { q: "5. El costo del software debe considerarse un gasto y no una inversión.", name: "q6", correct: "falso" }
  ];

  let score = 0;
  datosEnviados = { "Nombre y Apellido": studentName, "Puntaje": 0 };

  // ----------------------
  // GENERAR PDF
  // ----------------------
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const leftMargin = 10;
  const rightMargin = 190;
  const lineWidth = rightMargin - leftMargin - 5;
  const pageHeight = doc.internal.pageSize.height;
  let y = 20;

  // Cabecera PDF
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.text("INSTITUTO TECNOLÓGICO SUPERIOR MECAPACA", 105, y, null, null, "center");
  y += 10;
  doc.setFontSize(13);
  doc.text("CARRERA: SISTEMAS INFORMÁTICOS", 105, y, null, null, "center");
  y += 10;
  doc.text("Cuestionario de Costo de Software", 105, y, null, null, "center");
  y += 10;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Nombre del estudiante: ${studentName}`, leftMargin, y);
  const fecha = new Date().toLocaleString();
  doc.text(`Fecha: ${fecha}`, 150, y);
  y += 10;

  // Preguntas
  for(const item of questions){
    const selected = document.querySelector(`input[name="${item.name}"]:checked`);
    const selectedValue = selected ? selected.value : "No respondida";
    datosEnviados[item.name] = selectedValue;

    let punto = 0;
    if(selectedValue.toLowerCase() === item.correct.toLowerCase()) punto = 1;
    score += punto;

    // Pregunta
    doc.setFont(undefined, "bold");
    const qLines = doc.splitTextToSize(item.q, lineWidth);
    qLines.forEach(line => {
      doc.text(line, leftMargin, y);
      y += 6;
      if(y > pageHeight - 20){ doc.addPage(); y = 20; }
    });

    // Opciones
    const options = Array.from(document.querySelectorAll(`input[name="${item.name}"]`)).map(opt=>{
      const enciso = opt.value;
      const text = opt.nextSibling.textContent.trim();
      const icon = opt.checked ? "☑" : "☐";
      let color = [0,0,0];
      if(enciso.toLowerCase() === item.correct.toLowerCase()) color = [0,128,0]; // verde correcta
      if(opt.checked && enciso.toLowerCase() !== item.correct.toLowerCase()) color = [255,0,0]; // rojo incorrecta
      return { text: `${icon} ${text}`, color };
    });

    options.forEach(opt=>{
      doc.setTextColor(...opt.color);
      const lines = doc.splitTextToSize(opt.text, lineWidth - 5);
      lines.forEach(line=>{
        doc.text(line, leftMargin+5, y);
        y += 6;
        if(y > pageHeight - 20){ doc.addPage(); y = 20; }
      });
    });

    doc.setTextColor(0,0,0);
    doc.text(`Puntaje: ${punto} / 1`, rightMargin-25, y-6);
    y += 5;
  }

  doc.setFont(undefined,"bold");
  doc.text(`Puntaje total: ${score} / ${questions.length}`, leftMargin, y);

  datosEnviados["Puntaje"] = score.toString();


  // ----------------------
  // DESCARGAR PDF
  // ----------------------
  doc.save(`Respuestas_${studentName}.pdf`);

  // ----------------------
  // GUARDAR EN SHEETBEST
  // ----------------------
  try{
    const response = await fetch(urlSheetBest, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datosEnviados)
    });
    if(response.ok) alert(`✅ Cuestionario enviado y guardado correctamente.\nPuntaje: ${score} / ${questions.length}`);
    else alert("❌ Error al guardar los datos en la hoja.");
  }catch(err){
    console.error(err);
    alert("❌ No se pudo conectar con SheetBest.");
  }

  spinner.style.display = 'none';
  sendFormBtn.disabled = false;
});
