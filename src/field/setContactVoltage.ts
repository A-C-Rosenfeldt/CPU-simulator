import { assert } from 'chai'
import {FieldToDiagonal} from './../fields'

// This code is for unit tests. Wired contacts are set using object references gatherd from Names ( single capital letter). The solver works locally on the graph of all wires and cells and it uses double buffers (optimize later?)
export function setContactVoltages(field: FieldToDiagonal, allElements: number[], values: number[] ){
	field.fieldInVarFloats.forEach( r=>{
		r.forEach( cell=>{
			if ( cell.Contact != null){
				assert( allElements[ cell.RunningNumberOfJaggedArray ]===0) // uh 0 I hat this, but this is all that fits into the map : String
				allElements[ cell.RunningNumberOfJaggedArray ] = values.pop()
			}
		})
	})
}