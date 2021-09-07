
/*
Flat surface emitts electrons at each cell and every time step.
Electrons span quads. This leads to tapes.

Can I live with only flat cathodes? Yes
Can I live with Quad LoD ?
    Time Lod: 

Charge position correction: With time steps. GPU is more important.
Space Charge: expansion in the inner part .. but low charge
Focussing: Why would you do that?
I need compensating space charge. Real tubes are 3d so have a 2d film for electrons. Projection of 3d vs doping. Doping probably. Current limiting by space charge still works. No HEMT, yet.

So anyway: Trajectory simulation with quads spanned. 
    Quads -> grid Field
    Verlet integration for the electrons based on grid field
        since electron points are off-grid anyway, we don't suffer additional disadvantage from delta being diffused by bilinear interpolation
    Field based on .. for precise timing on the point charge. We appreciate the diffusion due to the grid. Nothing more needed.
        We can always substract the influence of a single electron from the field to get the Force for Verlet.

Quads are only used for display. Track-density = reciprok => color

So maybe even (soft) limit the velocity of electrons to grid-size = mean free path in real solids-
Charge-charge repulsion within the grid. So the tracks move as a whole. You could sample the field in the mean of the old vertices. Each vertex is only allowed to move in uh exception cascade unitl the middle normal of its edges.
*/

import { Tridiagonal } from "../enforcePivot";
import { FieldToDiagonal } from "../fields";
import { ContactedField } from "../fieldStatic";

class Electron{
    location:[number,number] /* Tupel instead of Array<number> */ =[0,0];
    derivatives=[this.location] // Verlet does not use this
    public Verlet(precedessor:Electron,successor:Electron){
        // Verlet integration senses the field at the current position for velocity+=accelertion,
        // but then takes a step back for the position and then: position+=2*velocity .

    }
    public SenseField(){
        // subtract own field from global field to remove noise due to grid. Also electrons don't feel their own field.
    }
    public electronInAdjacentTrajectory:Electron; // ref

    public Set2(delta:Array<number>){
        this.location.forEach((me,i)=>{
            me=2*delta[i]
        })
    }

    public Sub(delta:Array<number>){
        this.location.forEach((me,i)=>{
            me-=delta[i]
        })
    }
}

// With Navier Stokes and co. you can either sit at a location or on a particle. The code for the former is in fieldStatic.ts ( bottom, commented out)
// Here we go with particles, which should be faster and maybe even give a coherent ( haha ) motion when jumping into coax cable.
class Trajectory{
    // Although I was burned with fixed constants in the Matrix code, I (still) need them in the simulation code
    public readonly length=12;
    public electrons:Electron[]= new Electron[length]
    cellPosition:number[]; // todo: Link to cell for the current to take effect. 
    direction: number;  // cell borders. |Speed| = 1
    // Emission: One particle per frame.  todo Current is R * electricField? Fiddle with value until space charge effects start to fade.
    public Propagate(field: FieldToDiagonal){
        // forEach does not work .. or shift at read? Electrons which did not hit the anode just vanish ( traps in semi / residual gas in tube )
        for(let i=0;i<this.electrons.length;i++){
            this.electrons[i].Set2(this.electrons[i-1].location)
            this.electrons[i].Sub(this.electrons[i-2].location) //+  // Is this verlet?? Yes, apparently it is just about staggering velocity.
            



            //let tupel=[4,5]
            // at least I need to round location. Otherwise getAt will fail. floor and ceil define that potential is at floor?
            // const corner=new Array<Array<number>>();
            // {
            //     const l=this.electrons[i-1].location
            //     for(let d=0;d<2;d++){
            //         corner.push( [Math.floor( l[d] ), Math.ceil( l[d] ) ] )
            //         //if (ceil==floor)
            //         const frac=(l[d]-corner[corner.length-1][0])
            //         // swap?
            //         // ConstTextToVarFloats
            //         field[corner[1][1-d]-corner[0][1-d]]
            //     }
            // }

            // I think one can read this as all corner. Again, for breaks symmetry. Though I need it for partial differntation

            //const force=new Array<number>();
            {
                // capture
                const l=this.electrons[i-1].location.map(o=>{const i=Math.floor(o); const f=o-i; return {i:i,f:f}; } );                
                let reverse=false
                const shorthand = (i:number,k:number) => field.fieldInVarFloats[l[1].i+i][l[0].i+k].Potential
                const reversed= (i:number,k:number) => reverse ? shorthand(k,i):shorthand(i,k);

                do{
                    for(let y=1;y>=0;y--){
                        this.electrons[i].location[reverse ?1:0] +=  reversed(1,y)-reversed(0,y)*l[0].f
                        l[0].f=1-l[0].f // interpolation ( not-so-functional coding style )

                        // // transpose. Hmm I have transpose for RLE Matrix, but not for jagged array?
                        // for(let x=0;x<=1;x++){
                        //     cols[x].push(row[x].Potential)
                        // }
                    }                    
                    l.shift()
                    reverse=!reverse
                }while(reverse);
            }

            // field.getAt(...this.electrons[i-1].location) ; // Electron should always be within a field. Right now cells are supposed to be squares. They have a potential. I need the field. So I need neighbours. Plural? Staggered cells bilinear? Does also work in 3d
            //   // bilinear interpolation

            // // mimic Poisson. Start values? Don't I need Verlet anyway?
            // 2*this.electrons[i]-
            // this.electrons[i-]-  // current frame. V
            // this.electrons[i+1]
        }
        // this.electrons.forEach(electron => {
        //     electron.Verlet();
        // });
    }
}

export class Cathode{
    public readonly width:number=8; // Indeed the map dictates the width. Transcribe on construction.
    public flow:Trajectory[]=new Trajectory[this.width];
    field: FieldToDiagonal;

    constructor(field:  FieldToDiagonal  ){
        this.field=field
    }

    public RenderMesh(): number{

        this.flow[0].Propagate(this.field)
        // Join trajectories which may go at different speed
        // Now I ( we all ) remember that the join algorithm does spontanous symmetry breaking, but otherwise its for in for.
        // Still we could try to generallize code use in Matrix.Add()
        // So, how to join here. We have no equi, but an only slightly more complicated rate adjuster
        // Wikipedia starts with a simple algorithm where the https://en.wikipedia.org/wiki/Circumscribed_circle
        // Of each triangle is checked to be free of other nodes. Correct by flip.
        // So every time step we go along the trajectory and check for flips.
        return 3; // 1/[x+1]-[x]  // zero distance would have infinite energy due to charge-charge repulsion
    }
}

/*

So I've got some divergence which cannot be explained
So I put a field of a positve charge onto it => divergence gone

This is how they told us to solve poisson interatively.
Charge, and U on boundary is given,
we see divergence at current position and add U to our halo.
This is matrix multiplication .. at least after we repeat it for multiple points.
So for same dielectric distribution around a point -> same column values in inverse matrix
I have not found analytical solutions which will help me with my visualization (hi res in space and time).

For free space the inverse can be derived analytical. It is some log(r) for U, 1/r for len(E).
Then I move metal into this .. keeping a far circle at its analyitical value.


----

I cannot build on top of linear equation solvers because I do not understand.
I mean, a halo

I only do a field up to a certain radius because I have to add them all up.
So it is like a 5px radius.

Do not optimize yet. Just a global meander over all cells. If semiconductor,
apply divergence calculation.


*/

/*

speed of light = 4 cells
    solve maxwell equation
        greens function anyway
        charge+current?

    trouble is: combined equations (light+charge) is nonlinear
    so for example I have trouble to simulate metal using the charge
        I could use dielectic constant.
            that acts as a fast first aid and communicates charge nned

speed of electrons = 1/4 cell
    density*gradient
        zero enforcement


Electron in front of metal could work,
but the charge surge needs to propagate to the halo. So basically I cut the metal at the end of the halo and then let poisson do its thing? I mean this will be calculated beforehand.
Do I need to calculate charge carriers? There will be divergence within the metal, it must sum up to 1 ( surface integral around halo. U in halo  relative to zero outside => E)
=> increase U in metal ( recalc poisson ) until surface integral is correct.

When i brush over the semicondoctor all wrong polarity charge carriers are elimated with correct charge carriers withing halo range

When I say I use dielectric constant and low resistance to mark a metal,
I am already done. It is just: should Greens function anticipate the behaviour of the other electrons?
Metal has both kinds of charge carriers.


Lets say I simulate metal beforehand like I add a single free electron fix in the space,
then iterate multiple timesteps for the metal electrons whithin the viewport / the configuration block.
So when an electron moves: remove field at old position, add at new.
Record metal electron movement and add that to ohmic drift.

Full maxwell equations has "inductivity" and thus slows down the signal and leads to a cut-off-
*/