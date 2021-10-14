import { Tridiagonal } from './public/enforcePivot';
// So the FET is a slab of silicon of finite width
var halfWidth = 3;
// additionally there is a repetetive structure of gates of finite height
var gateHeight = 3;
// Metal (reminder: the pull-up transistor on n-fet is not connected to a wire)
// Semiconductor
// Isolator
class fetStack {
    constructor() {
        // 0. copied from fields.ts
        // 1. every odd line has height 1 (for current), every even has gateHeight
        this.example = [
            'mmmmmmm',
            //'sssiiim', 
            'sssiiii',
            'sssiiim',
            'sssiiii',
            'sssmmmm',
            'sssiiim',
            'sssiiii',
            'mmmmmmm', // simple boundary condition
        ];
    }
    // for inhomogenous part. I iterate ++, current, --, current
    getBorder(line /* 1 is interpreted as "max" */) {
        return [5, 3, 34];
    }
    composeAndFlood() {
        var metal_met = 0;
        const matrix = new Tridiagonal(1);
        const cell = this.example[0][0];
        let ones = 0;
        if (cell === 'm') {
            if (metal_met) {
                // redirect to the other column in the matrix
                ones++; // from template
                return; // do not add row
            }
            else {
                metal_met = matrix.row.length - 1;
            }
        }
        throw "implementation moved!"; // matrix.row.push(new Row(metal_met,0,[[],(new Array(ones).fill(1)),[]]))
    }
}
//# sourceMappingURL=tile.js.map