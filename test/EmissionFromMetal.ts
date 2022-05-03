import {OutStream,  PerEdge,sucks, iterateOverAllEdges} from "../src/EmissionFromMetal"
import { Field, Tupel } from "../src/fields";

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
		sucks(swap.fieldInVarFloats[0] , strokes, [0,0] ) // direction: { vertical: boolean } = { vertical: false })		
		expect(strokes.length ).to.equal(8)
	})

})