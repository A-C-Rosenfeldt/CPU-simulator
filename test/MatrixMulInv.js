"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const enforcePivot_1 = require("../UnderTest/enforcePivot");
const chai_1 = require("chai");
require("mocha");
describe('Multiply', () => {
    const size = 3;
    const unit = new enforcePivot_1.Tridiagonal(size);
    beforeEach(function () {
        for (var i = 0; i < size; i++) {
            unit.row[i] = enforcePivot_1.Row.Single(i, 5); //0,[[],[5],[]])
        }
        console.log("unit.row[0].starts[0] before " + unit.row[0].starts[0]);
    });
    it('Transpose diag', () => {
        console.log("unit.row[0].starts[0] transpose " + unit.row[0].starts[0]);
        // swaps permute also
        const trans = new enforcePivot_1.Transpose(unit);
        trans.next(); // move into column 0
        let c = trans.getCellInRow(0);
        (0, chai_1.expect)(c).to.equal(5);
        let r = trans.c.get(0);
        (0, chai_1.expect)(r).to.equal(5);
        trans.next();
        c = trans.getCellInRow(1); // bug from jop repeating?
        (0, chai_1.expect)(c).to.equal(5);
    });
    it('Row cursor for Transpose', () => {
        {
            const row = enforcePivot_1.Row.Single(0, 7);
            const cursor = new enforcePivot_1.RowCursor(row);
            const v = cursor.advance(0);
            (0, chai_1.expect)(v).to.equal(7);
        }
        {
            const row = enforcePivot_1.Row.Single(1, 8);
            const cursor = new enforcePivot_1.RowCursor(row);
            let v = cursor.advance(0);
            (0, chai_1.expect)(v).to.equal(0);
            v = cursor.advance(1);
            (0, chai_1.expect)(v).to.equal(8);
        }
        {
            const row = enforcePivot_1.Row.Single(1, 8);
            row.starts[1]++;
            row.data[0].push(9);
            const cursor = new enforcePivot_1.RowCursor(row);
            let i = 0;
            let v = cursor.advance(i++);
            (0, chai_1.expect)(v).to.equal(0);
            v = cursor.advance(i++);
            (0, chai_1.expect)(v).to.equal(8);
            v = cursor.advance(i++);
            (0, chai_1.expect)(v).to.equal(9);
        }
        {
            const row = enforcePivot_1.Row.Single(0, 8);
            row.starts[1]++;
            row.data[0].push(9);
            const cursor = new enforcePivot_1.RowCursor(row);
            let i = 0;
            let v = cursor.advance(i++);
            (0, chai_1.expect)(v).to.equal(8);
            v = cursor.advance(i++);
            (0, chai_1.expect)(v).to.equal(9);
            v = cursor.advance(i++);
            (0, chai_1.expect)(v).to.equal(0);
        }
    });
    it('Transpose with row[0] completely filled', () => {
        const prmu = new enforcePivot_1.Tridiagonal(size);
        let i = 0;
        prmu.row[i++] = enforcePivot_1.Row.Single(0, 8);
        prmu.row[0].data[0] = [7, 8, 9];
        prmu.row[0].starts = [0, 3];
        prmu.row[i++] = enforcePivot_1.Row.Single(2, 2);
        prmu.row[i++] = enforcePivot_1.Row.Single(2, 3);
        const trans = new enforcePivot_1.Transpose(prmu);
        trans.next(); // move into column 0
        (0, chai_1.expect)(trans.pos).to.equal(0);
        let r = trans.c.get(0);
        (0, chai_1.expect)(r).to.equal(7);
        trans.next();
        r = trans.c.get(0);
        (0, chai_1.expect)(r).to.equal(8);
        trans.next();
        r = trans.c.get(0);
        (0, chai_1.expect)(r).to.equal(9);
    });
    it('Transpose with col[0] completely filled', () => {
        const prmu = new enforcePivot_1.Tridiagonal(size);
        let i = 0;
        prmu.row[i++] = enforcePivot_1.Row.Single(0, 7);
        prmu.row[i++] = enforcePivot_1.Row.Single(0, 8);
        prmu.row[i++] = enforcePivot_1.Row.Single(0, 9);
        const trans = new enforcePivot_1.Transpose(prmu);
        trans.next(); // move into column 0
        let r = trans.c.get(0);
        (0, chai_1.expect)(r).to.equal(7);
        r = trans.c.get(1);
        (0, chai_1.expect)(r).to.equal(8);
        r = trans.c.get(2);
        (0, chai_1.expect)(r).to.equal(9);
    });
    it('Transpose with row[1] completely filled', () => {
        const prmu = new enforcePivot_1.Tridiagonal(size);
        let i = 0;
        prmu.row[i++] = enforcePivot_1.Row.Single(2, 2);
        prmu.row[i++] = enforcePivot_1.Row.Single(0, 8);
        prmu.row[1].data[0] = [7, 8, 9];
        prmu.row[1].starts = [0, 3];
        prmu.row[i++] = enforcePivot_1.Row.Single(2, 3);
        const trans = new enforcePivot_1.Transpose(prmu);
        trans.next(); // move into column 0
        let r = trans.c.get(1);
        (0, chai_1.expect)(r).to.equal(7);
        trans.next();
        r = trans.c.get(1);
        (0, chai_1.expect)(r).to.equal(8);
        trans.next();
        r = trans.c.get(1);
        (0, chai_1.expect)(r).to.equal(9);
    });
    it('Transpose with row[1] completely filled and row[0] empty', () => {
        const prmu = new enforcePivot_1.Tridiagonal(size);
        let i = 0;
        prmu.row[i++] = enforcePivot_1.Row.Single(0, 0);
        prmu.row[0].starts = [];
        prmu.row[0].data = [];
        prmu.row[i++] = enforcePivot_1.Row.Single(0, 8);
        prmu.row[1].data[0] = [7, 8, 9];
        prmu.row[1].starts = [0, 3];
        prmu.row[i++] = enforcePivot_1.Row.Single(2, 3);
        const trans = new enforcePivot_1.Transpose(prmu);
        trans.next(); // move into column 0
        let r = trans.c.get(1);
        (0, chai_1.expect)(r).to.equal(7);
        trans.next();
        r = trans.c.get(1);
        (0, chai_1.expect)(r).to.equal(8);
        trans.next();
        r = trans.c.get(1);
        (0, chai_1.expect)(r).to.equal(9);
    });
    it('Transpose with col[1] completely filled', () => {
        const prmu = new enforcePivot_1.Tridiagonal(size);
        let i = 0;
        prmu.row[i++] = enforcePivot_1.Row.Single(1, 7);
        prmu.row[i++] = enforcePivot_1.Row.Single(1, 8);
        prmu.row[i++] = enforcePivot_1.Row.Single(1, 9);
        const trans = new enforcePivot_1.Transpose(prmu);
        trans.next(); // move into column 0
        trans.next();
        let r = trans.c.get(0);
        (0, chai_1.expect)(r).to.equal(7);
        r = trans.c.get(1);
        (0, chai_1.expect)(r).to.equal(8);
        r = trans.c.get(2);
        (0, chai_1.expect)(r).to.equal(9);
    });
    it('Transpose that matrix for permutation', () => {
        const prmu = new enforcePivot_1.Tridiagonal(size);
        let i = 0;
        prmu.row[i++] = enforcePivot_1.Row.Single(0, 1);
        prmu.row[i++] = enforcePivot_1.Row.Single(2, 2);
        prmu.row[i++] = enforcePivot_1.Row.Single(1, 3);
        const trans = new enforcePivot_1.Transpose(prmu);
        trans.next(); // move into column 0
        let r = trans.c.get(0);
        (0, chai_1.expect)(r).to.equal(1);
        trans.next();
        r = trans.c.get(2);
        (0, chai_1.expect)(r).to.equal(3);
        trans.next();
        r = trans.c.get(1);
        (0, chai_1.expect)(r).to.equal(2);
    });
    it('Transpose Dense', () => {
        const dense = new enforcePivot_1.Tridiagonal(size);
        for (let i = 0; i < size; i++) {
            dense.row[i] = new enforcePivot_1.Row([]);
            dense.row[i].starts = [0, size];
            dense.row[i].data = [[4 + i, 7 + i, 5 + i]];
        }
        const trans = new enforcePivot_1.Transpose(dense);
        trans.next(); // move into column 0
        let r = trans.c.get(0);
        (0, chai_1.expect)(r).to.equal(4);
        trans.next();
        r = trans.c.get(2);
        (0, chai_1.expect)(r).to.equal(9);
        trans.next();
        r = trans.c.get(2);
        (0, chai_1.expect)(r).to.equal(7);
        /*
        475
        586
        697
        */
    });
    it('inner Procuct0', () => {
        // swaps permute also
        const a = enforcePivot_1.Row.Single(0, 1);
        const b = enforcePivot_1.Row.Single(0, 2);
        const jop = new enforcePivot_1.JopWithRefToValue(a, b);
        console.log("lenght of  i: " + jop.i.length + " s " + jop.s.length + "  behind " + jop.behind);
        (0, chai_1.expect)(jop.next()).lt(jop.behind);
        let product = a.innerProductRows(b);
        (0, chai_1.expect)(product).equal(2);
        const c = enforcePivot_1.Row.Single(1, 1);
        product = a.innerProductRows(c);
        (0, chai_1.expect)(product).equal(0);
        b.starts[1]++;
        b.data[0].push(3);
        product = a.innerProductRows(b);
        (0, chai_1.expect)(product).equal(2);
        product = c.innerProductRows(b);
        (0, chai_1.expect)(product).equal(3);
        product = c.innerProductRows(c);
        (0, chai_1.expect)(product).equal(1);
    });
    it('inner Product  delayed', () => {
        const ao = enforcePivot_1.Row.Single(1, 1);
        const bo = enforcePivot_1.Row.Single(2, 2);
        let product = ao.innerProductRows(bo);
        (0, chai_1.expect)(product).equal(0);
    });
    it('permutation', () => {
        // swaps permute also
        const prmu = new enforcePivot_1.Tridiagonal(size);
        let i = 0;
        prmu.row[i++] = enforcePivot_1.Row.Single(0, 1);
        prmu.row[i++] = enforcePivot_1.Row.Single(2, 1);
        prmu.row[i++] = enforcePivot_1.Row.Single(1, 1);
        const product = unit.MatrixProduct(prmu);
        // transparent box testing
        for (let i = 0; i < 3; i++) {
            (0, chai_1.expect)(product.row[i].starts).deep.equal(prmu.row[i].starts);
        }
        // opaque box texting
        (0, chai_1.expect)(product.getAt(0, 0)).equal(5);
        (0, chai_1.expect)(product.getAt(1, 2)).equal(5);
    });
    it('integer scale', () => {
        const dense = new enforcePivot_1.Tridiagonal(size);
        for (let i = 0; i < size; i++) {
            dense.row[i] = new enforcePivot_1.Row([]);
            dense.row[i].starts = [0, size];
            dense.row[i].data = [[4 + i, 7 + i, 5 + i]];
        }
        const product = unit.MatrixProduct(dense);
        (0, chai_1.expect)(product.getAt(0, 0)).equal(20);
        (0, chai_1.expect)(product.getAt(1, 2)).equal(30);
    });
    it('rotation pi', () => {
        const rota = new enforcePivot_1.Tridiagonal(size);
        let i = -1;
        let angle = Math.PI;
        rota.row[++i] = new enforcePivot_1.Row([]);
        rota.row[i].starts = [0, 2];
        rota.row[i].data = [[+Math.cos(angle), Math.sin(angle)]];
        rota.row[++i] = new enforcePivot_1.Row([]);
        rota.row[i].starts = [0, 2];
        rota.row[i].data = [[-Math.sin(angle), Math.cos(angle)]];
        rota.row[++i] = enforcePivot_1.Row.Single(2, 1);
        (0, chai_1.expect)(rota.getAt(0, 0)).approximately(-1, 0.001);
        (0, chai_1.expect)(rota.getAt(1, 1)).approximately(-1, 0.001);
        (0, chai_1.expect)(rota.getAt(0, 1)).approximately(0, 0.001);
        (0, chai_1.expect)(rota.getAt(1, 0)).approximately(0, 0.001);
        let product = unit.MatrixProduct(rota);
        (0, chai_1.expect)(rota.getAt(0, 0)).approximately(-1, 0.001);
        (0, chai_1.expect)(rota.getAt(1, 1)).approximately(-1, 0.001);
        (0, chai_1.expect)(rota.getAt(0, 1)).approximately(0, 0.001);
        (0, chai_1.expect)(rota.getAt(1, 0)).approximately(0, 0.001);
        product.row.forEach((r, i) => {
            console.log(" starts: " + r.starts + "  values: " + r.data);
            if (i < 2)
                (0, chai_1.expect)(r.starts).deep.eq([0, 2]);
        });
        // I got strange results in dense. Isolate the ingredients
        const t = new enforcePivot_1.Transpose(rota); // hoisting. Todo: Move dependet class up
        t.next(); // column by column. This fits second matrix to compensate for going cross rows. Left matrix doesn't care becaus MAC is along it rows. Result can't complain because we still stream it (no random access).
        (0, chai_1.expect)(t.c.starts).deep.eq([0, 2]);
        (0, chai_1.expect)(product.row[0].starts).deep.eq([0, 2]);
        (0, chai_1.expect)(product.row[0].data[0][0]).approximately(-5, 0.001);
        (0, chai_1.expect)(product.row[0].data[0][1]).approximately(0, 0.001);
        (0, chai_1.expect)(product.row[0].starts).deep.eq([0, 2]);
        (0, chai_1.expect)(t.c.data[0][0]).approximately(-1, 0.001);
        (0, chai_1.expect)(t.c.data[0][1]).approximately(0, 0.001);
        const inner = product.row[0].innerProductRows(t.c);
        /**
         * going to slice  '-5,6.123233995736766e-16' slice(0,2), '-1,-1.2246467991473532e-16' slice(0,2)
            push r: -7.498798913309289e-32
         *  .. so okay. Aggregation was missing. As a small hint: A local variable was not used, maybe look out for warnings?
         */
        (0, chai_1.expect)(inner).approximately(5, 0.001); // 2021-01-21 this was c.a. 0 .. before reduce : -7.498798913309289e-32
        (0, chai_1.expect)(product.getAt(0, 0)).approximately(-5, 0.001);
        let product2 = product.MatrixProduct(rota);
        product2.row.forEach(r => {
            console.log(" starts: " + r.starts + "  values: " + r.data);
        });
        (0, chai_1.expect)(product2.getAt(0, 0)).approximately(5, 0.001);
    });
    it('rotation pi/2', () => {
        const rota = new enforcePivot_1.Tridiagonal(size);
        let i = -1;
        let angle = Math.PI / 2;
        rota.row[++i] = new enforcePivot_1.Row([]);
        rota.row[i].starts = [0, 2];
        rota.row[i].data = [[+Math.cos(angle), Math.sin(angle)]];
        rota.row[++i] = new enforcePivot_1.Row([]);
        rota.row[i].starts = [0, 2];
        rota.row[i].data = [[-Math.sin(angle), Math.cos(angle)]];
        rota.row[++i] = enforcePivot_1.Row.Single(2, 1);
        let product = unit.MatrixProduct(rota);
        (0, chai_1.expect)(product.getAt(0, 0)).approximately(0, 0.001);
        product = product.MatrixProduct(rota);
        (0, chai_1.expect)(product.getAt(0, 0)).approximately(-5, 0.001);
    });
    it('rotation pi/3', () => {
        const rota = new enforcePivot_1.Tridiagonal(size);
        let i = -1;
        let angle = Math.PI / 3;
        rota.row[++i] = new enforcePivot_1.Row([]);
        rota.row[i].starts = [0, 2];
        rota.row[i].data = [[+Math.cos(angle), Math.sin(angle)]];
        rota.row[++i] = new enforcePivot_1.Row([]);
        rota.row[i].starts = [0, 2];
        rota.row[i].data = [[-Math.sin(angle), Math.cos(angle)]];
        rota.row[++i] = enforcePivot_1.Row.Single(2, 1);
        let product = unit.MatrixProduct(rota);
        product = product.MatrixProduct(rota);
        product = product.MatrixProduct(rota);
        (0, chai_1.expect)(product.getAt(0, 0)).approximately(-5, 0.001);
    });
    it('scale', () => {
        const single = enforcePivot_1.Row.Single(2, 3);
        single.scale(5);
        (0, chai_1.expect)(single.get(2)).to.equal(15);
    });
    it('invert unit', () => {
        (0, chai_1.expect)(unit.getAt(0, 0)).approximately(5, 0.001);
        const inverse = unit.inverse(); // calls Rectangular() internally
        (0, chai_1.expect)(unit.getAt(0, 0)).approximately(5, 0.001);
        (0, chai_1.expect)(inverse.getAt(0, 0)).approximately(0.2, 0.001);
        (0, chai_1.expect)(inverse.getAt(1, 1)).approximately(0.2, 0.001);
    });
});
describe('Inverse', () => {
    it('rotation pi/3', () => {
        const size = 2;
        const dense = new enforcePivot_1.Tridiagonal(size);
        {
            let i = -1;
            dense.row[++i] = new enforcePivot_1.Row([]);
            dense.row[i].starts = [0, size];
            dense.row[i].data = [[4, 5]];
            dense.row[++i] = new enforcePivot_1.Row([]);
            dense.row[i].starts = [0, size];
            dense.row[i].data = [[8, 9]];
        }
        const rota = new enforcePivot_1.Tridiagonal(size);
        {
            let i = -1;
            let angle = Math.PI / 3;
            rota.row[++i] = new enforcePivot_1.Row([]);
            rota.row[i].starts = [0, 2];
            rota.row[i].data = [[+Math.cos(angle), Math.sin(angle)]];
            rota.row[++i] = new enforcePivot_1.Row([]);
            rota.row[i].starts = [0, 2];
            rota.row[i].data = [[-Math.sin(angle), Math.cos(angle)]];
        }
        let product = dense.MatrixProduct(rota);
        product = product.MatrixProduct(rota);
        product = product.MatrixProduct(rota);
        (0, chai_1.expect)(product.getAt(0, 0)).approximately(-4, 0.001);
        (0, chai_1.expect)(product.getAt(1, 0)).approximately(-8, 0.001);
        (0, chai_1.expect)(product.getAt(0, 1)).approximately(-5, 0.001);
        (0, chai_1.expect)(product.getAt(1, 1)).approximately(-9, 0.001);
    });
    it('dense 1x1', () => {
        const size = 1;
        const dense = new enforcePivot_1.Tridiagonal(size);
        let i = -1;
        dense.row[++i] = new enforcePivot_1.Row([]);
        dense.row[i].starts = [0, size];
        dense.row[i].data = [[4]];
        const det = 4;
        let inverse = dense.inverse();
        let j = -1;
        console.log(inverse.row[++j].data[0].map(x => x * det));
        (0, chai_1.expect)(inverse.row[j].data[0][0] * det).approximately(1, 0.001);
    });
    it('dense 2x2', () => {
        const size = 2;
        const dense = new enforcePivot_1.Tridiagonal(size);
        let i = -1;
        dense.row[++i] = new enforcePivot_1.Row([]);
        dense.row[i].starts = [0, size];
        dense.row[i].data = [[4, 5]];
        dense.row[++i] = new enforcePivot_1.Row([]);
        dense.row[i].starts = [0, size];
        dense.row[i].data = [[8, 9]];
        const det = 4 * 9 - 5 * 8;
        let inverse = dense.inverse();
        let j = -1;
        console.log("raw*det: " + inverse.row[++j].data[0].map(x => x * det));
        console.log("raw*det: " + inverse.row[++j].data[0].map(x => x * det));
        j = 0;
        (0, chai_1.expect)(inverse.row[j].data[0][0] * det).approximately(9, 0.001);
        (0, chai_1.expect)(inverse.row[j].data[0][1] * det).approximately(-5, 0.001);
        j = 1;
        (0, chai_1.expect)(inverse.row[j].data[0][0] * det).approximately(-8, 0.001);
        (0, chai_1.expect)(inverse.row[j].data[0][1] * det).approximately(4, 0.001);
        inverse = inverse.inverse();
        j = -1;
        console.log("raw*det: " + inverse.row[++j].data[0]);
        console.log("raw*det: " + inverse.row[++j].data[0]);
        j = 0;
        (0, chai_1.expect)(inverse.row[j].data[0][0] * 1).approximately(4, 0.001);
        (0, chai_1.expect)(inverse.row[j].data[0][1] * 1).approximately(5, 0.001);
        j = 1;
        (0, chai_1.expect)(inverse.row[j].data[0][0] * 1).approximately(8, 0.001);
        (0, chai_1.expect)(inverse.row[j].data[0][1] * 1).approximately(9, 0.001);
    });
    it('Multiply with inverse (left and right) should result in unity ( within 1e-6 precsision )', () => {
        const size = 3;
        const dense = new enforcePivot_1.Tridiagonal(size);
        for (let i = 0; i < size; i++) {
            dense.row[i] = new enforcePivot_1.Row([]);
            dense.row[i].starts = [0, size];
            dense.row[i].data = [[4 + i, 7 + i, 5 + i]];
            dense.row[i].data[0][i] += 3; // in my application the main diagonal is supposed to dominate. Todo: instead of "enforcePivot", maybe check Pivot beforehand?
        }
        const inverse = dense.inverse();
        // for (let i = 0; i < size; i++) {
        // 	expect(dense.row[i].starts).deep.eq( [0, size] );
        // 	const literal=dense.row[i].data[0]
        // 	console.log("should all be integer: " + literal)
        //     expect(literal).deep.equal( [4 + i, 7 + i, 5 + i] );
        // }
        // restore dense ( todo later incorporate this into inverse. I mean, inplace mod should lead to identiy always..)
        for (let i = 0; i < size; i++) {
            dense.row[i] = new enforcePivot_1.Row([]);
            dense.row[i].starts = [0, size];
            dense.row[i].data = [[4 + i, 7 + i, 5 + i]];
            dense.row[i].data[0][i] += 3;
        }
        const product = inverse.MatrixProduct(dense);
        //   for (let i = 0; i < size; i++) {
        //     expect(dense.row[i].starts).deep.eq( [0, size] );
        //     expect(dense.row[i].data[0]).deep.equal( [4 + i, 7 + i, 5 + i] );
        // }
        (0, chai_1.expect)(product.getAt(0, 0)).approximately(1, 0.001);
        (0, chai_1.expect)(product.getAt(1, 1)).approximately(1, 0.001);
    });
});
