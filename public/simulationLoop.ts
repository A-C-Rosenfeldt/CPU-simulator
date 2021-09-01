import { Tridiagonal } from './enforcePivot.js';
import { Field , bandsGapped, Contact, Tupel} from './fields.js'
import { ContactedField, FinFet } from './fieldStatic'
class Simulation{
	keyPressed:boolean;
	run(){
		const map=new ContactedField(bandsGapped,null) // load map
		map.floodfills(0) // floodfill 1/2
		let mat:Tridiagonal=map.ToDoubleSquareMatrixOnlyWhatIsNeeded_GroundedElectrodes()  // create Matrix
		mat.inverse() // Todo: Remove interal link. This file demonstrates the (performance) idea that the expensive  inverse()  only happens on load, not within step or even phase
		let sensible=100
		// Intervall instead of Timeout prevents any notion of stackoverflow
		this.keyPressed=false
		const id=window.setInterval(()=>{ 
			if (this.keyPressed || sensible-- <0){ window.clearInterval(id)}
			 //  multiply with Matrix
			map.floodfills(1) // floodfill to copy back matrix values to map for display ( or modify display code? )
			propapageParticleSystem(); // 
			//  store values on contacts ( Q or what)			
			//let fet=new FinFet() // OhmCarriers like NavierStokes is done. GPU friendly? But on JS I prefer particles like in Blender..  . carriers? out of loop? 
			//fet.DoAllXandThenYOrSo(pde);

			//map.  //  fieldStatic.ts/(PDE?|FinFET)/OhmAll .. No OOP relation yet. 
		},400);

		document.addEventListener( "keypress", e => {
			this.keyPressed=true
			// e = e || window.event;
			// use e.keyCode
		});
	}
}