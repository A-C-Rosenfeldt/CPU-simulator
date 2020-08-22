// stores all matrices needed by the field( requested by tiles[top, bottom])
// not much code, but the basics of performance considerations.

// Pro tile: use 3 Tile environment for calculation (think of the reacting electrons on the metal surfaces), store 

// Ah, I probably have to define a halo here already.
// Halo is circular ( some good looking pixel variant)
// this look translates to the effects
// the number of px in the halo must be minimal
// global effects on the metal electrodes are
/// not important for the function
/// do not look better
/// I do not know how to simulate them (math is complicated)

/*
vertical line at x
*/


/*
horicontal line at top or bottom with rounded edge.
Only store top version and deliver flipped as bottom
*/

// row starting at x going to the right
const edge=['SMMMM',
            'SSMMM',
]