import { Tridiagonal } from './enforcePivot.js';
import { Field , bandsGapped, Contact, Tupel} from './fields.js'
import { ContactedField } from './fieldStatic'
import { Cathode } from './field/semiconductor'
class Simulation{
	keyPressed:boolean;
	run(){
		var chargePotential:number[]
		const map=new ContactedField(bandsGapped,null) // load map
		let floodedInEven: boolean = true;
		map.floodfills(floodedInEven) // floodfill 1/2
		let mat:Tridiagonal=map.ToDoubleSquareMatrixOnlyWhatIsNeeded_GroundedElectrodes()  // create Matrix
		mat.inverse() // Todo: Remove interal link. This file demonstrates the (performance) idea that the expensive  inverse()  only happens on load, not within step or even phase

		let sensible=100
		// Intervall instead of Timeout prevents any notion of stackoverflow
		this.keyPressed=false
		const id=window.setInterval(()=>{ 
			if (this.keyPressed || sensible-- <0){ window.clearInterval(id)}
			 //  multiply with Matrix
			floodedInEven=!floodedInEven // invert marker meaning. This minimizes state. Every floodfill is like the first
			map.floodfills(floodedInEven, /*collect U?)*/ ) // floodfill to copy back matrix values to map for display ( or modify display code? )			
			chargePotential=new Cathode(map); //propapageParticleSystem(); // 

			const nakedVector=[]
			//{ // gather known data
				//const t=map.fieldInVarFloats[0][0]
				map.fieldInVarFloats.forEach( r=>r.forEach( f =>{ // cannot use  map  because I need a flat vector 
				nakedVector.push(   (f.RunningNumberOfJaggedArray >=0 ) ? f.ChargeDensity :	f.Potential )
				}  )) 
			//}	
			const onlyNowKnown=mat.MatrixProduct( nakedVector ) // chargePotential )  
			//{ // gather known data
				//const t=map.fieldInVarFloats[0][0]
				map.fieldInVarFloats.forEach( r=>r.forEach( f =>{ // cannot use  map  because I need a flat vector 
				if (f.RunningNumberOfJaggedArray >=0 ) {
					 f.ChargeDensity = onlyNowKnown.pop()
					}else{
						f.Potential =onlyNowKnown.pop()
					}
				}  
			//}	
	

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