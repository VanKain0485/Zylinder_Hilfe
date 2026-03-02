const tips = [
  {
    title: 'Tipp 1: Grundfläche erkennen',
    prompt: 'Welche Form hat die Grundfläche eines Zylinders?',
    answer: 'Die Grundfläche ist ein Kreis.'
  },
  {
    title: 'Tipp 2: Kreisfläche wiederholen',
    prompt: 'Wie lautet die Formel für die Fläche eines Kreises?',
    answer: 'A = π · r²'
  },
  {
    title: 'Tipp 3: Vom Flächeninhalt zum Volumen',
    prompt: 'Wie bekommt man aus einer Grundfläche ein Volumen?',
    answer: 'Volumen = Grundfläche · Höhe'
  },
  {
    title: 'Tipp 4: Alles einsetzen',
    prompt: 'Setze die Kreisfläche in die Volumenformel ein.',
    answer: 'V = (π · r²) · h = π · r² · h'
  },
  {
    title: 'Tipp 5: Bedeutung der Variablen',
    prompt: 'Wofür stehen r und h?',
    answer: 'r ist der Radius der Kreisfläche, h ist die Höhe des Zylinders.'
  },
  {
    title: 'Tipp 6: Einheit prüfen',
    prompt: 'Welche Einheit hat das Volumen?',
    answer: 'Immer eine Kubikeinheit, z. B. cm³ oder m³.'
  }
];

const tipGrid = document.getElementById('tipGrid');

for (const tip of tips) {
  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'tip-card';
  card.innerHTML = `
    <h3>${tip.title}</h3>
    <p class="prompt">${tip.prompt}</p>
    <p class="answer">${tip.answer}</p>
  `;

  card.addEventListener('click', () => {
    card.classList.toggle('open');
  });

  tipGrid.appendChild(card);
}

const showSolutionButton = document.getElementById('showSolution');
const solution = document.getElementById('solution');

showSolutionButton.addEventListener('click', () => {
  solution.classList.toggle('hidden');
  showSolutionButton.textContent = solution.classList.contains('hidden')
    ? 'Musterlösung einblenden'
    : 'Musterlösung ausblenden';
});
