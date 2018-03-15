"use strict";

var canvas;
var gl;

var numVertices  = 36;

var texSize = 256;
var numChecks = 8;

var program;

var texture1, texture2, texture3;
var t1, t2;

var c;

var flag = true;

var image1 = new Uint8Array(4*texSize*texSize);

var pl = 1;
document.getElementById("point_light_button").style.background='#f08080';
var dl = 0;
document.getElementById("directional_light_button").style.background='#ffd700';
var sl = 0;
document.getElementById("spot_light_button").style.background='#ffd700';
var gs = 1;
document.getElementById("gouraud_model_button").style.background='#f08080';
var ps = 0;
document.getElementById("phong_model_button").style.background='#ffd700';
var new_text = 0;
document.getElementById("new_text").style.background='#ffd700';


    for ( var i = 0; i < texSize; i++ ) {
        for ( var j = 0; j <texSize; j++ ) {
            var patchx = Math.floor(i/(texSize/numChecks));
            var patchy = Math.floor(j/(texSize/numChecks));
            if(patchx%2 ^ patchy%2) c = 255;
            else c = 0;
            //c = 255*(((i & 0x8) == 0) ^ ((j & 0x8)  == 0))
            image1[4*i*texSize+4*j] = c;
            image1[4*i*texSize+4*j+1] = c;
            image1[4*i*texSize+4*j+2] = c;
            image1[4*i*texSize+4*j+3] = 255;
        }
    }

var image2 = new Uint8Array(4*texSize*texSize);

    // Create a checkerboard pattern
    for ( var i = 0; i < texSize; i++ ) {
        for ( var j = 0; j <texSize; j++ ) {
            image2[4*i*texSize+4*j] = 127+127*Math.sin(0.1*i*j);
            image2[4*i*texSize+4*j+1] = 127+127*Math.sin(0.1*i*j);
            image2[4*i*texSize+4*j+2] = 127+127*Math.sin(0.1*i*j);
            image2[4*i*texSize+4*j+3] = 255;
           }
    }
var image3 = new Uint8Array(4*texSize*texSize);
    var a,b,c;
    for ( var i = 0; i < texSize; i++ ) {
        for ( var j = 0; j <texSize; j++ ) {
            a=(Math.random() * 128) + 1;
            b=(Math.random() * 128) + 1;
            c=(Math.random() * 128) + 1;
            image3[4*i*texSize+4*j] = a;
            image3[4*i*texSize+4*j+1] = b;
            image3[4*i*texSize+4*j+2] = c;
            image3[4*i*texSize+4*j+3] =255;

           }
    }


var pointsArray = [];
var colorsArray = [];
var texCoordsArray = [];
//arrayNormal vector
var normalsArray = [];

var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
];

var vertices = [
    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5, -0.5, -0.5, 1.0 )
];

var vertexColors = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 0.0, 1.0, 1.0, 1.0 ),  // white
    vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan
];

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = xAxis;

var theta = [45.0, 45.0, 45.0];

var thetaLoc;

function config_text() {
    texture1 = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture1 );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, image1);
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
                      gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    texture2 = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture2 );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, image2);
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
                      gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    texture3 = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture3 );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, image3);
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
                      gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
}

function quad(a, b, c, d) {
	//creo le normali. Sottraggo due vertici e calcolo il cross product per trovare il vettore uscente. Carico una normale per vertice(anche se saranno identiche)
	 var t1 = subtract(vertices[b], vertices[a]); 
	 var t2 = subtract(vertices[c], vertices[b]); 
	 var normal = cross(t1, t2); 
	 var normal = vec3(normal);
	 normal = normalize(normal);

     pointsArray.push(vertices[a]);
     colorsArray.push(vertexColors[a]);
     texCoordsArray.push(texCoord[0]);
     normalsArray.push(normal);

     pointsArray.push(vertices[b]);
     colorsArray.push(vertexColors[a]);
     texCoordsArray.push(texCoord[1]);
     normalsArray.push(normal);

     pointsArray.push(vertices[c]);
     colorsArray.push(vertexColors[a]);
     texCoordsArray.push(texCoord[2]);
     normalsArray.push(normal);

     pointsArray.push(vertices[a]);
     colorsArray.push(vertexColors[a]);
     texCoordsArray.push(texCoord[0]);
     normalsArray.push(normal);

     pointsArray.push(vertices[c]);
     colorsArray.push(vertexColors[a]);
     texCoordsArray.push(texCoord[2]);
     normalsArray.push(normal);

     pointsArray.push(vertices[d]);
     colorsArray.push(vertexColors[a]);
     texCoordsArray.push(texCoord[3]);
     normalsArray.push(normal);
}

function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}


function build_light() {
	//funzione per inizializzare i parametri per la luce. Uso la stessa per ogni tipologia possibile, e saranno mutualmente esclusive
	var light_pos = vec4(1.0, 0.0, 1.0, 0.0 ); 
	var light_ambient = vec4(0.4, 0.4, 0.4, 1.0 ); 
	var light_diffuse = vec4( 1.0, 1.0, 1.0, 1.0 ); 
	var light_specular = vec4( 1.0, 1.0, 1.0, 1.0 );

	var material_ambient = vec4( 1.0, 1.0, 1.0, 1.0 ); 
	var material_diffuse = vec4( 1.0, 1.0, 1.0, 1.0); 
	var material_specular = vec4( 1.0, 0.8, 0.8, 1.0 ); 
	var material_brightness = 10.0;

	var ambient_prod = mult(light_ambient, material_ambient); 
	var diffuse_prod = mult(light_diffuse, material_diffuse); 
	var specular_prod = mult(light_specular, material_specular);

	//setto le variabili degli shader
  gl.uniform4fv(gl.getUniformLocation(program, "ambient_prod"),flatten(ambient_prod)); 
  gl.uniform4fv(gl.getUniformLocation(program, "diffuse_prod"),flatten(diffuse_prod)); 
  gl.uniform4fv(gl.getUniformLocation(program, "specular_prod"),flatten(specular_prod)); 
  gl.uniform4fv(gl.getUniformLocation(program, "light_pos"),flatten(light_pos)); 
  gl.uniform1f(gl.getUniformLocation(program, "brightness"),material_brightness); 
}


window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram(program);

    colorCube();
    //creo la luce
    build_light();


    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW );

    var vertex_color = gl.getAttribLocation( program, "vertex_color" );
    gl.vertexAttribPointer( vertex_color, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vertex_color );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );

    var vertex_position = gl.getAttribLocation( program, "vertex_position" );
    gl.vertexAttribPointer( vertex_position, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vertex_position );

    var vN_Buffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vN_Buffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW ); 

    var vertex_normal = gl.getAttribLocation( program, "vertex_normal" );
    gl.vertexAttribPointer( vertex_normal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vertex_normal );

    var tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW );

    var vertex_tex_coord = gl.getAttribLocation( program, "vertex_tex_coord" );
    gl.vertexAttribPointer( vertex_tex_coord, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vertex_tex_coord );




    config_text();

    gl.activeTexture( gl.TEXTURE0 );
    gl.bindTexture( gl.TEXTURE_2D, texture1 );
    gl.uniform1i(gl.getUniformLocation( program, "Tex0"), 0);

    gl.activeTexture( gl.TEXTURE1 );
    gl.bindTexture( gl.TEXTURE_2D, texture2 );
    gl.uniform1i(gl.getUniformLocation( program, "Tex1"), 1);

    gl.activeTexture( gl.TEXTURE2 );
    gl.bindTexture( gl.TEXTURE_2D, texture3 );
    gl.uniform1i(gl.getUniformLocation( program, "Tex2"), 2);

    thetaLoc = gl.getUniformLocation(program, "theta");


 document.getElementById("ButtonX").onclick = function(){axis = xAxis;};
 document.getElementById("ButtonY").onclick = function(){axis = yAxis;};
 document.getElementById("ButtonZ").onclick = function(){axis = zAxis;};
 document.getElementById("ButtonT").onclick = function(){flag = !flag;};
//vari bottoni. Le luci sono mutuamente esclusive
 document.getElementById("point_light_button").onclick = function(){if(pl == 1 ) 
                                                            document.getElementById("point_light_button").style.background='#ffd700';
                                                          else
                                                            document.getElementById("point_light_button").style.background='#f08080';
                                                          pl = !pl; 
                                                          if(dl == 1 && pl == 1) {
                                                            dl = 0;
                                                            document.getElementById("directional_light_button").style.background='#ffd700';
                                                           }
                                                           if(pl == 1 && sl == 1) {
                                                            sl = 0;
                                                            document.getElementById("spot_light_button").style.background='#ffd700';
                                                           }
                                                        };
 document.getElementById("directional_light_button").onclick = function(){if(dl == 1 ) 
                                                            document.getElementById("directional_light_button").style.background='#ffd700';
                                                          else
                                                            document.getElementById("directional_light_button").style.background='#f08080';
                                                          dl = !dl; 
                                                          if(dl == 1 && pl == 1){
                                                            pl = 0;
                                                            document.getElementById("point_light_button").style.background='#ffd700';
                                                          }
                                                          if(dl == 1 && sl == 1){
                                                            sl = 0;
                                                            document.getElementById("spot_light_button").style.background='#ffd700';
                                                          }
                                                        };
 document.getElementById("spot_light_button").onclick = function(){if(sl == 1 ) 
                                                            document.getElementById("spot_light_button").style.background='#ffd700';
                                                          else
                                                            document.getElementById("spot_light_button").style.background='#f08080';
                                                          sl = !sl; 
                                                          if(sl == 1 && pl == 1){
                                                            pl = 0;
                                                            document.getElementById("point_light_button").style.background='#ffd700';
                                                          }
                                                          if(dl == 1 && sl == 1){
                                                            dl = 0;
                                                            document.getElementById("directional_light_button").style.background='#ffd700';
                                                          }
                                                        };
 document.getElementById("gouraud_model_button").onclick = function(){if(gs == 1 ) 
                                                            document.getElementById("gouraud_model_button").style.background='#ffd700';
                                                          else
                                                            document.getElementById("gouraud_model_button").style.background='#f08080';
                                                          gs = !gs;
                                                          if(ps == 1 ) 
                                                            document.getElementById("phong_model_button").style.background='#ffd700';
                                                          else
                                                            document.getElementById("phong_model_button").style.background='#f08080'; 
                                                          ps = !ps;};
 document.getElementById("phong_model_button").onclick = function(){if(ps == 1 ) 
                                                            document.getElementById("phong_model_button").style.background='#ffd700';
                                                          else
                                                            document.getElementById("phong_model_button").style.background='#f08080'; 
                                                          ps = !ps; 
                                                          if(gs == 1 ) 
                                                            document.getElementById("gouraud_model_button").style.background='#ffd700';
                                                          else
                                                            document.getElementById("gouraud_model_button").style.background='#f08080';
                                                        gs = !gs;};
    
   document.getElementById("new_text").onclick = function() {new_text = !new_text;
                                                          if(new_text == 1 ) 
                                                            document.getElementById("new_text").style.background='#f08080';
                                                          else
                                                            document.getElementById("new_text").style.background='#ffd700';
                                                          }
    render();
}

var render = function() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    if(flag) theta[axis] += 2.0;
    gl.uniform3fv(thetaLoc, theta);
    //mando i flag dei bottoni per i casi if negli shader
    gl.uniform1i(gl.getUniformLocation( program, "pl_active"), pl);
    gl.uniform1i(gl.getUniformLocation( program, "dl_active"), dl);
    gl.uniform1i(gl.getUniformLocation( program, "sl_active"), sl);
    gl.uniform1i(gl.getUniformLocation( program, "phong_model"), ps);
    gl.uniform1i(gl.getUniformLocation( program, "gouraud_model"), gs);
    gl.uniform1i(gl.getUniformLocation( program, "add_new_text"), new_text);
    gl.drawArrays( gl.TRIANGLES, 0, numVertices );
    requestAnimFrame(render);
}