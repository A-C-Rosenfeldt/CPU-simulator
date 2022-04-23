import { Cloneable, Row, Tridiagonal } from '../src/enforcePivot';
import { MapForField, exampleField, FieldToDiagonal, fieldTobeSquared, Field, bandsGapped, Contact } from '../src/fields'
import { main } from '../src/GL';
import { ContactedField } from '../src/fieldStatic'

import { setContactVoltages } from '../src/field/setContactVoltage.js';
//import { Field } from './fields.js';

import { expect } from 'chai';
import 'mocha';

describe('end2end', () => {
	it('symmetry', () => {

		var contacts2d = ['BBsss',
			'BBsss',
			'sssss',
			'sssAA',
			'sssAA'];
		var voltages = [2, 4];
		for (var variations = 0; variations < 8;) {
			var Swap = new Field(contacts2d);
			var [v, m] = Swap.ShapeToSparseMatrix();
			//imageM.push( imageGlM) //main('FieldGl0_field',imageGl) 
			m.AugmentMatrix_with_Unity(-1);
			Swap.GroupByKnowledge(m); // Optional laast parameter: I don't think I drop columns here. Was all in vector and ShapeToSparse Matrix
			// too big imageM.push(m.PrintGl());
			m.inverseRectangular(); // in place. Still wonder if I should provide a immutable version
			//		imageM.push(m.PrintGl());
			setContactVoltages(Swap, v, voltages);
			const M2 = m.split(); // uses the -1 from above.  //new Tridiagonal(0) // split does not work in place because it may need space at the seam
			// Maybe hide/encapsulate the rows? M2.row = m.row.map(r => r.split(1, m.row.length)) // this is ugly internal stuff. I guess I need in place before I can get new features.
			const potential = M2.MatrixProduct(v); // No charge yet .. so all semiconductor entries are 0 . I sure need to test that before I add carriers ( tube .. before doping )
			Swap.pullInSemiconductorVoltage(potential); // opposite of groupByKnowledge
			const imageField = Swap.PrintGl(0);
			//images.push(imageField);
			console.log("[RGBA: " + imageField.pixel[0] + "," + imageField.pixel[1] + "," + imageField.pixel[2] + "," + imageField.pixel[3]);
			const end = imageField.pixel.length - 4;
			console.log("]RGBA: " + imageField.pixel[0 + end] + "," + imageField.pixel[1 + end] + "," + imageField.pixel[2 + end] + "," + imageField.pixel[3 + end]);

			const allowed = [[0, 179, 121, 255],
			[0, 89, 121, 255]]
			var hits = 0
			for (var em = 1; em >= 0; em --) {
				for (var en = end; en >= 0; en -= end) {
					var misses = 0
					for (var i = 0; i < 4; i++) {
						if (imageField.pixel[i + en] != allowed[em][i]) misses++
					}
					if (misses == 0) hits++
				}
			}

			
			expect(hits).to.equal( variations&2 ) // funny accident

			if ((++variations & 7) == 4)
				contacts2d = contacts2d.map(s => {
					// strings are immutable in JS. But arrays are not. So we are forced to use Join.
					const a = s.split('');
					a.reverse();
					return a.join("");
				});
			if ((variations & 3) == 2)
				contacts2d.reverse();
			if ((variations & 1) == 1)
				voltages.reverse();
		}
	})
})