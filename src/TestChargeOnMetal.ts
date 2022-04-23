import { main, SimpleImage } from './GL.js';
import { Tridiagonal } from './enforcePivot.js';
import { setContactVoltages } from './field/setContactVoltage.js'
import { Field } from './fields.js';

const imageM: SimpleImage[] = []
{
	const images: SimpleImage[] = []


	// taken from test/fields.ts .. Replaced literal voltage digits by capital letters
	const contactsAverage: string[] = ['BiA']; // check average in center
	const contacts2d: string[] = ['Bss',
		'ssA']; // should all float up to the one given potential


	const Swap = new Field(contacts2d)
	var imageGl = Swap.PrintGl()
	images.push(imageGl)
	const [v, m] = Swap.ShapeToSparseMatrix();

	//imageM.push( m.PrintGl())
	//imageM.push( imageGlM) //main('FieldGl0_field',imageGl) 
	m.AugmentMatrix_with_Unity(-1)
	Swap.GroupByKnowledge(m) // Optional laast parameter: I don't think I drop columns here. Was all in vector and ShapeToSparse Matrix
	//imageM.push(m.PrintGl());
	m.inverseRectangular() // in place. Still wonder if I should provide a immutable version
	//		imageM.push(m.PrintGl());
	setContactVoltages(Swap, v, [2, 4])
	const M2 = m.split() // uses the -1 from above.  //new Tridiagonal(0) // split does not work in place because it may need space at the seam
	// Maybe hide/encapsulate the rows? M2.row = m.row.map(r => r.split(1, m.row.length)) // this is ugly internal stuff. I guess I need in place before I can get new features.
	const potential = M2.MatrixProduct(v) // No charge yet .. so all semiconductor entries are 0 . I sure need to test that before I add carriers ( tube .. before doping )
	Swap.pullInSemiconductorVoltage(potential) // opposite of groupByKnowledge


	var imageGl = Swap.PrintGl()
	images.push(imageGl) //main('FieldGl0_field',imageGl) 


	main('metal_charge', images)
}

{
	const images: SimpleImage[] = []

	// taken from test/fields.ts .. Replaced literal voltage digits by capital letters
	{
		var contacts2d: string[] =
			['BBsss',
				'BBsss',
				'sssss',
				'sssAA',
				'sssAA'];

		var voltages = [2, 4];

		for (var variations = 0; variations < 8; ) {

			var Swap = new Field(contacts2d)
			var [v, m] = Swap.ShapeToSparseMatrix();


			//imageM.push( imageGlM) //main('FieldGl0_field',imageGl) 
			m.AugmentMatrix_with_Unity(-1)
			Swap.GroupByKnowledge(m) // Optional laast parameter: I don't think I drop columns here. Was all in vector and ShapeToSparse Matrix
			// too big imageM.push(m.PrintGl());
			m.inverseRectangular() // in place. Still wonder if I should provide a immutable version

			//		imageM.push(m.PrintGl());
			setContactVoltages(Swap, v, voltages)
			const M2 = m.split() // uses the -1 from above.  //new Tridiagonal(0) // split does not work in place because it may need space at the seam
			// Maybe hide/encapsulate the rows? M2.row = m.row.map(r => r.split(1, m.row.length)) // this is ugly internal stuff. I guess I need in place before I can get new features.
			const potential = M2.MatrixProduct(v) // No charge yet .. so all semiconductor entries are 0 . I sure need to test that before I add carriers ( tube .. before doping )
			Swap.pullInSemiconductorVoltage(potential) // opposite of groupByKnowledge

			const imageField = Swap.PrintGl(0);
			images.push(imageField)
			
			console.log( "[RGBA: "+imageField.pixel[0]+","+imageField.pixel[1]+","+imageField.pixel[2]+","+imageField.pixel[3])
			const end=imageField.pixel.length-4
			console.log( "]RGBA: "+imageField.pixel[0+end]+","+imageField.pixel[1+end]+","+imageField.pixel[2+end]+","+imageField.pixel[3+end])

			if ((++variations & 7) == 4) contacts2d=contacts2d.map(s => {
				// strings are immutable in JS. But arrays are not. So we are forced to use Join.
				const a = s.split('')
				a.reverse()
				return a.join("")
			})
			if ((variations & 3) == 2) contacts2d.reverse()
			if ((variations & 1) == 1) voltages.reverse()
		}
	}

	//main('metal_charge', imageM)
	// }

	// {
	// 	const images: SimpleImage[] = []

	{
		// taken from test/fields.ts .. Replaced literal voltage digits by capital letters
		const contacts2d: string[] =
			['BBBssss',
				'BBBssss',
				'BBBssss',
				'sssssss',
				'ssssAAA',
				'ssssAAA',
				'ssssAAA'];


		const Swap = new Field(contacts2d)
		const [v, m] = Swap.ShapeToSparseMatrix();

		//var imageGlM = m.PrintGl()
		//imageM.push( imageGlM) //main('FieldGl0_field',imageGl) 
		m.AugmentMatrix_with_Unity(-1)
		Swap.GroupByKnowledge(m) // Optional laast parameter: I don't think I drop columns here. Was all in vector and ShapeToSparse Matrix
		imageM.push(m.PrintGl()); // too big
		m.inverseRectangular() // in place. Still wonder if I should provide a immutable version

		setContactVoltages(Swap, v, [2, 4])
		imageM.push(m.PrintGl());
		const M2 = m.split() // uses the -1 from above.  //new Tridiagonal(0) // split does not work in place because it may need space at the seam
		imageM.push(M2.PrintGl());

		const potential = M2.MatrixProduct(v) // No charge yet .. so all semiconductor entries are 0 . I sure need to test that before I add carriers ( tube .. before doping )
		Swap.pullInSemiconductorVoltage(potential) // opposite of groupByKnowledge


		var imageGl = Swap.PrintGl()
		images.push(imageGl) //main('FieldGl0_field',imageGl) 

		// too big  main('metal_charge_matrix', imageM)
		main('surfac_bulk', images)
	}

	main('metal_charge_matrix', imageM)
}