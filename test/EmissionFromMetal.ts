import {OutStream,  PerEdge,sucks, iterateOverAllEdges} from "../src/EmissionFromMetal"
import { Field, Metal, Tupel } from "../src/fields";

var oneEdge: string[] =
	['ms'];

const swap : Field  = new Field(oneEdge)


import { expect } from 'chai';
import 'mocha';

describe('emission', () => {
	it('iterate', () => {
		const log:number[][]=[]
		function sucks(a: Tupel[], strokes: OutStream, topLeft: number[], direction: { vertical: boolean } = { vertical: false }):void {
			log.push(topLeft)
		}		
		iterateOverAllEdges(swap, sucks)
		expect(log.length).to.equal(1)
	})
	it('suck', () => {
		const strokes=[]
		for(var i=0;i<2;i++)swap.fieldInVarFloats[0][i].Potential=i

		// check test data
		{
			const a=swap.fieldInVarFloats[0] ;
			var i=0 ;

			expect( (a[i] instanceof Metal) !== (a[i ^ 1] instanceof Metal) ).to.equal(true)

			expect(a[i].BandGap < 3 /*threeQuarterConductor todo:inject*/).to.equal(true) ;		// ToDo: not a metal	
			expect( (a[i ^ 1] instanceof Metal) ).to.equal(false)
			expect(a[i].Potential > a[i ^ 1].Potential).to.equal(false)
			i++
			expect(a[i].BandGap < 3 /*threeQuarterConductor todo:inject*/).to.equal(true) ;
			expect( (a[i ^ 1] instanceof Metal) ).to.equal(true)
			expect(a[i].Potential > a[i ^ 1].Potential).to.equal(true)
		}
		{
			// // check bolean expression
			// if (
			// 	(true !== false ) && // inteface  // // FieldToDiagonal{ ConstTextToVarFloats(){Map([['i', 2] ['s', 1]}  ; literalVoltageBoost=2 }
			// 	(a[i].Potential > a[i ^ 1].Potential) //=== (a.BandGap<threeQuarterConductor)  // voltage sucks
			// ) {
		}

		sucks(swap.fieldInVarFloats[0] , strokes, [0,0] ) // direction: { vertical: boolean } = { vertical: false })		
		expect(strokes.length ).to.equal(4)
	})

})