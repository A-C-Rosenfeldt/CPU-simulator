import { Tridiagonal, Row } from '../public/enforcePivot';
import { expect } from 'chai';
import 'mocha';

describe('Multiply', () => {
	const size = 3
	const unit = new Tridiagonal(size)
	beforeEach(function(){		
		const unit = new Tridiagonal(size)
		for(var i=0;i<size;i++){
		  unit.row[i]=Row.Single(i,5) //0,[[],[5],[]])
		}
	})

	it('permutation', () => {
		// swaps permute also
		const prmu = new Tridiagonal(size)
		let i=0
		  unit.row[i++]=Row.Single(0,1)
		  unit.row[i++]=Row.Single(2,1)
		  unit.row[i++]=Row.Single(1,1)

		  const product = unit.MatrixProductUsingTranspose(prmu)
		  expect(product.getAt(0,0)).equal(5)
		  expect(product.getAt(1,2)).equal(5)
	})

	it('integer scale', () => {
		const dense = new Tridiagonal(size)
		for(let i=0;i<size;i++){
			dense.row[++i]=new Row([]);dense.row[i].starts=[0,size];dense.row[i].data=[[4+i,7+i,5+i]]
		}
		  const product = unit.MatrixProductUsingTranspose(dense)
		  expect(product.getAt(0,0)).equal(20)
		  expect(product.getAt(1,2)).equal(30)		
	})

	it('rotation 2pi/n', () => {
		const rota = new Tridiagonal(size)
		let i=-1
		const angle=Math.PI/3
		rota.row[++i]=new Row([]);rota.row[i].starts=[0,size];rota.row[i].data=[[+Math.cos(Math.PI/3),Math.sin(Math.PI/3)]]
		rota.row[++i]=new Row([]);rota.row[i].starts=[0,size];rota.row[i].data=[[-Math.sin(Math.PI/3),Math.cos(Math.PI/3)]]
		const product = unit.MatrixProductUsingTranspose(rota).MatrixProductUsingTranspose(rota).MatrixProductUsingTranspose(rota)
		expect(product.getAt(0,0)).approximately(-5,0.001)
		expect(product.getAt(1,1)).approximately(-5,0.001)
		expect(product.getAt(1,0)).approximately(0,0.001)
		expect(product.getAt(0,1)).approximately(0,0.001)
	})	

	it('invert unit', () => {
		const inverse=unit.inverse()
		  expect(inverse.getAt(0,0)).approximately(0.2,0.001)
		  expect(inverse.getAt(1,1)).approximately(0.2,0.001)
	})

})  

describe('Inverse', () => {
	it('Multiply with inverse (left and right) should result in unity ( within 1e-6 precsision )', () => {
		const size=3
		const dense = new Tridiagonal(size)
		for(let i=0;i<size;i++){
			dense.row[++i]=new Row([]);dense.row[i].starts=[0,size];dense.row[i].data=[[4+i,7+i,5+i]]
		}
		const inverse=dense.inverse()
		  const product = inverse.MatrixProductUsingTranspose(dense)
		  expect(product.getAt(0,0)).approximately(1,0.001)
		  expect(product.getAt(1,1)).approximately(1,0.001)
	  })
})  