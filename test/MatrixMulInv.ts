import { Tridiagonal, Row, Transpose } from '../public/enforcePivot';
import { expect } from 'chai';
import 'mocha';

describe('Multiply', () => {
	const size = 3
	const unit = new Tridiagonal(size)
	beforeEach(function(){
		for(var i=0;i<size;i++){
		  unit.row[i]=Row.Single(i,5) //0,[[],[5],[]])
		}
		console.log("unit.row[0].starts[0] before "+unit.row[0].starts[0])
	})
	it('Transpose', () => {
		console.log("unit.row[0].starts[0] transpose "+unit.row[0].starts[0])
		// swaps permute also
		const trans = new Transpose(unit)
		trans.next() // move into column 0
		let c=trans.getCellInRow(0)
		expect(c).to.equal(5)
		let r=trans.c.get(0)
		expect(r).to.equal(5)

		trans.next()
		c=trans.getCellInRow(1) // bug from jop repeating?
		expect(c).to.equal(5)

	})

	it('inner Procuct0', () => {
		// swaps permute also
		const a=Row.Single(0,1)
		const b=Row.Single(0,2)

		  let product = a.innerProductColumn(b)
		  expect(product).equal(2)

		const c=Row.Single(1,1)  
		product = a.innerProductColumn(c)
		expect(product).equal(0)
		
		b.starts[1]++
		b.data[0].push(3)
		product = a.innerProductColumn(b)
		expect(product).equal(2)

		product = c.innerProductColumn(b)
		expect(product).equal(6)

		product = c.innerProductColumn(c)
		expect(product).equal(13)
	})
		it('inner Product  delayed', () => {
		const ao=Row.Single(1,1)
		const bo=Row.Single(2,2)		
		let product=ao.innerProductColumn(bo)
		expect(product).equal(0)
	})

	it('permutation', () => {
		// swaps permute also
		const prmu = new Tridiagonal(size)
		let i=0
		prmu.row[i++]=Row.Single(0,1)
		prmu.row[i++]=Row.Single(2,1)
		prmu.row[i++]=Row.Single(1,1)

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