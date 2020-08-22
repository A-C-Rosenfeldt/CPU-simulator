// So the FET is a slab of silicon of finite width
var halfWidth=3
// additionally there is a repetetive structure of gates of finite height
var gateHeight=3

// Metal (reminder: the pull-up transistor on n-fet is not connected to a wire)
// Semiconductor
// Isolator

class fetStack{

// 0. copied from fields.ts
// 1. every odd line has height 1 (for current), every even has gateHeight
 example=
[ // connected m  . Connected to wire with impedance=50
    'mmmmmmm', // contact
    //'sssiiim', 

    'sssiiii',  // we assume homognous electric field between plates (the side walls of the gates)

    'sssiiim', // gate
    'sssiiii',  // we assume homognous electric field between plates (the side walls of the gates)


    'sssmmmm',
    'sssiiim',
    'sssiiii',  // we assume homognous electric field between plates (the side walls of the gates)
    'mmmmmmm', // simple boundary condition
]



// for inhomogenous part. I iterate ++, current, --, current
getBorder(line:number /* 1 is interpreted as "max" */){
 return [5,3,34]
}

composeAndFlood(){
    var metal_met=null

    if (cell === 'm'){
        if (metal_met){
            // redirect to the other column in the matrix
            matrix[current_Row][metal_met]=1 // from template
            return ; // do not add row
        }else{
            metal_met=*cell
        }
    }

    matrix.push("row") // matrix ( like the cell array )  is jagged


}
