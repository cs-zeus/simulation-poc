import Interactive from 'https://vectorjs.org/interactive.js';

const displayGrid = true;
const charges = [];
let testCharge;

const containerElement = document.getElementById('my-interactive');
//TODO: Make Interactive size dynamically equal to parent size
console.log(containerElement.parentElement.clientWidth);
console.log(containerElement.parentElement.clientHeight, window.innerHeight);

// Initialize the interactive
const margin = 64; //TODO: Make Interactive size dynamically equal to parent size
const interactive = new Interactive('my-interactive');
interactive.originX = interactive.width / 2 + margin;
interactive.originY = interactive.height / 2 + margin;
interactive.width += 2 * margin;
interactive.height += 2 * margin;
interactive.style.overflow = 'visible';

//TODO: Refactor this code
// Add charge function for painting new charge and their label
function addCharge(q, x, y, count = 0, isTestCharge = false) {
	const point = interactive.control(x, y);
	point.stroke = 'none';
	charges.push({ point, x, y });
	if (isTestCharge) {
		testCharge = point;
	}
	const circle = interactive.circle(0, 0, 20);
	if (isTestCharge) {
		circle.classList.add('test-charge');
	}
	circle.addDependency(point);
	circle.update = function () {
		this.cx = point.x;
		this.cy = point.y;
	};

	const chargeText = interactive.text(0, 0, q > 0 ? '+' : '-');
	chargeText.fontSize = '20px';
	chargeText.textAnchor = 'middle';
	chargeText.addDependency(point);
	chargeText.update = function () {
		if (q > 0) {
			this.x = point.x - 12;
			this.y = point.y + 10;
		} else {
			this.x = point.x - 8;
			this.y = point.y + 11;
		}
	};

	if (q > 0) {
		circle.classList.add('positive');
		chargeText.classList.add('positive');
	} else {
		circle.classList.add('negative');
		chargeText.classList.add('negative');
	}

	const text = interactive.text(150, 150, 'myText');
	text.addDependency(point);
	text.update = function () {
		this.x = point.x - 30;
		this.y = point.y + 40;
		if (isTestCharge) {
			this.contents = `Test Charge`;
		} else {
			this.contents = `Charge ${count}`;
		}
	};

	const text2 = interactive.text(150, 150, 'myText');
	text2.addDependency(point);
	text2.update = function () {
		this.x = point.x - 35;
		this.y = point.y + 60;
		this.contents = `${q}n - <${point.x / 50},${-point.y / 50}>`;
	};

	if (!isTestCharge) {
		const line = interactive.line(point.x, point.y, testCharge.x, testCharge.y);
		line.addDependency(testCharge);
		line.addDependency(point);
		line.update = function () {
			this.x1 = point.x;
			this.y1 = point.y;
			this.x2 = testCharge.x;
			this.y2 = testCharge.y;
		};

		const arrow = interactive.path('');
		arrow.classList.add('arrow');
		arrow.addDependency(testCharge);
		arrow.addDependency(point);
		arrow.update = function () {
			const r = 8;
			const offset = 0;
			const angle = Math.atan2(testCharge.y - point.y, testCharge.x - point.x);
			this.d = `M ${testCharge.x + 1.3 * r * Math.cos(angle)} ${
				testCharge.y + 1.3 * r * Math.sin(angle) + offset
			}
  L ${testCharge.x + r * Math.cos(angle - (2 * Math.PI) / 3)} ${
				testCharge.y + r * Math.sin(angle - (2 * Math.PI) / 3) + offset
			}
  L ${testCharge.x + r * Math.cos(angle + (2 * Math.PI) / 3)} ${
				testCharge.y + r * Math.sin(angle + (2 * Math.PI) / 3) + offset
			}
            Z`;
		};
		arrow.update();
	}
}

function drawGraph(addCharges) {
	// Add axis line
	const xAxis = interactive.line(
		-interactive.width / 2 + margin,
		0,
		interactive.width / 2 - margin,
		0
	);
	const yAxis = interactive.line(
		0,
		-interactive.height / 2 + margin,
		0,
		interactive.height / 2 - margin
	);

	// Add graph border
	interactive.rectangle(
		xAxis.x1,
		yAxis.y1,
		xAxis.x2 - xAxis.x1,
		yAxis.y2 - yAxis.y1
	);

	// Add arrow head of axis
	const marker = interactive.marker(10, 5, 10, 10);
	marker.path('M 0 0 L 10 5 L 0 10 z');
	marker.setAttribute('orient', 'auto-start-reverse');
	xAxis.setAttribute('marker-end', `url(#${marker.id})`);
	xAxis.setAttribute('marker-start', `url(#${marker.id})`);
	yAxis.setAttribute('marker-end', `url(#${marker.id})`);
	yAxis.setAttribute('marker-start', `url(#${marker.id})`);

	// Add label to axis
	const xAxisLabel = interactive.text(xAxis.x2 + 16, xAxis.y2, 'x');
	xAxisLabel.setAttribute('alignment-baseline', 'middle');
	const yAxisLabel = interactive.text(yAxis.x1, yAxis.y1 - 16, 'y');
	yAxisLabel.setAttribute('text-anchor', 'middle');

	const w = 50;
	const h = 50;
	const xGridNumber = 6;
	const yGridNumber = 3;

	//TODO: Add logic to scale the grid from 3 x 6 dynamically to X x Y -> Maybe multiply by current number of charges?
	//TODO: Also the initial 3 x 6 should be dynamically obtained from the parent size
	for (let i = -xGridNumber; i <= xGridNumber; i++) {
		const x = i * w;
		const label = interactive.text(x, 120 + margin, i.toString());
		label.style.textAnchor = 'middle';
		label.style.alignmentBaseline = 'middle';
		if (displayGrid) {
			const vertical = interactive.line(x, -150, x, 150);
			vertical.style.strokeOpacity = '.2';
		}
	}
	for (let i = -yGridNumber; i <= yGridNumber; i++) {
		const y = i * h;
		const label = interactive.text(-300 - 20, y, (i * -1).toString());
		label.style.textAnchor = 'middle';
		label.style.alignmentBaseline = 'middle';
		if (displayGrid) {
			const horizontal = interactive.line(-300, y, 300, y);
			horizontal.style.strokeOpacity = '.2';
		}
	}

	// Should call before below loop
  for (const f of addCharges) {
    f();
  }

	// Update position of charges
	for (const charge of charges) {
		charge.point.constrainWithinBox(xAxis.x1, yAxis.y1, xAxis.x2, yAxis.y2);
		const boxConstraint = charge.point.constrain;
		charge.point.constrain = (_, n) => {
			const x = w * Math.round(n.x / w);
			const y = h * Math.round(n.y / h);
			const p = boxConstraint({ x: x, y: y }, { x: x, y: y });
			return { x: p.x, y: p.y };
		};
		charge.point.translate(charge.x * w, charge.y * h);
	}
}

drawGraph([
	() => addCharge(-10, 3, -1, undefined, true),
	() => addCharge(10, 3, 1, 1),
	() => addCharge(-1, -2, 2, 2),
]);
