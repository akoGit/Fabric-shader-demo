import "../../style.css";
import * as THREE from "three";
import { Pane } from "tweakpane";
// import * as TweakpaneImagePlugin from 'tweakpane-image-plugin';
import vertex from "../shaders/vertex.glsl";
import fragment from "../shaders/fragment.glsl";
import tex1 from "../assets/tex.jpg"
import tex2 from "../assets/dust.jpg"
import tex3 from "../assets/dust2.jpg"
// import { gsap } from 'gsap';


export default class Fabric {
	constructor() {
		this.clock = new THREE.Clock();
		this.canvas = document.getElementById('canvas');
		let frustumSize = 1;
		this.camera = new THREE.OrthographicCamera(
			frustumSize / -2,
			frustumSize / 2,
			frustumSize / 2,
			frustumSize / -2,
			-1000,
			1000
		);

		// this.camera = new THREE.PerspectiveCamera(45, this.canvas.clientWidth / this.canvas.clientHeight, 0.1, 10);
		// this.camera.position.z = 1;
		this.scene = new THREE.Scene();
		this.renderer = new THREE.WebGLRenderer({
			canvas: this.canvas,
			antialias: true,
			alpha: true,
		});
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.settings();
		this.resize();
		this.addObjects();
		this.render();
		this.setUpResize();
		this.animate()
		this.setupImageUpload();
	}


	setupImageUpload() {
		const fileInput = document.getElementById('img');
		fileInput.addEventListener('change', (event) => {
			const file = event.target.files[0];
			if (file) {
				const reader = new FileReader();
				reader.onload = (e) => {
					const image = new Image();
					image.src = e.target.result;
					image.onload = () => {
						const texture = new THREE.Texture(image);
						// texture.minFilter = THREE.NearestFilter;
						// texture.magFilter = THREE.NearestFilter;
						texture.wrapS = THREE.RepeatWrapping;
						texture.wrapT = THREE.RepeatWrapping;
						texture.needsUpdate = true;
						this.material.uniforms.tex2.value = texture;
					};
				};
				reader.readAsDataURL(file);
			}
		});
	}

	settings() {

		this.PARAMS = {
			lightness: 1.0,
			colr: 0.52,
			colg: 0.5,
			colb: 0.4,
			MOUSE_STRENGTH: 1.0,
			MOUSE_SIZE: 0.7,
			SCALE: 1.0,
			DUST_OPACITY: 1.0,
			// image: new Image(),
		};
		const pane = new Pane();
		// pane.registerPlugin(TweakpaneImagePlugin);

		this.folder = pane.addFolder({
			title: "Debug",
			expanded: false
		});


		this.folder.addBinding(this.PARAMS, "lightness", {
			min: 0.0,
			max: 1
		});

		this.folder.addBinding(this.PARAMS, 'colr', {
			min: 0.0,
			max: 2.0
		});
		this.folder.addBinding(this.PARAMS, 'colg', {
			min: 0.0,
			max: 2.0
		});
		this.folder.addBinding(this.PARAMS, 'colb', {
			min: 0.0,
			max: 2.0
		});



		this.folder.addBinding(this.PARAMS, 'MOUSE_STRENGTH', {
			min: 0.0,
			max: 10.0
		});
		this.folder.addBinding(this.PARAMS, 'MOUSE_SIZE', {
			min: 0.0,
			max: 10.0
		});
		this.folder.addBinding(this.PARAMS, 'SCALE', {
			min: 0.0,
			max: 10.0
		});
		this.folder.addBinding(this.PARAMS, 'DUST_OPACITY', {
			min: 0.0,
			max: 10.0
		});


		// this.folder.addBinding(params, 'image', {
		// 	extensions: '.jpg, .gif',
		// });


	}

	addObjects() {

		// const corsImageModified = new Image();
		// corsImageModified.crossOrigin = "Anonymous";
		// corsImageModified.src = "";

		const loader = new THREE.TextureLoader();
		this.uniforms = {
			time: { type: "f", value: 0 },
			mouse: { value: [0.001, 0.001] },
			u_colr: { value: this.PARAMS.colr },
			u_colg: { value: this.PARAMS.colg },
			u_colb: { value: this.PARAMS.colb },
			u_lightness: { value: this.PARAMS.lightness },
			MOUSE_STRENGTH: { value: this.PARAMS.MOUSE_STRENGTH },
			MOUSE_SIZE: { value: this.PARAMS.MOUSE_SIZE },
			SCALE: { value: this.PARAMS.SCALE },
			DUST_OPACITY: { value: this.DUST_OPACITY },
			tex1: {
				value: loader.load(tex1, (texture) => {
					// texture.minFilter = THREE.LinearFilter;
					// texture.magFilter = THREE.LinearFilter;

					// texture.minFilter = THREE.NearestFilter;
					// texture.magFilter = THREE.NearestFilter;

					texture.wrapS = THREE.RepeatWrapping;
					texture.wrapT = THREE.RepeatWrapping;
					texture.needsUpdate = true;
				})
			},
			tex2: {
				value: loader.load(tex2, (texture) => {
					// texture.minFilter = THREE.LinearFilter;
					// texture.magFilter = THREE.LinearFilter;

					// texture.minFilter = THREE.NearestFilter;
					// texture.magFilter = THREE.NearestFilter;

					texture.wrapS = THREE.RepeatWrapping;
					texture.wrapT = THREE.RepeatWrapping;
					texture.needsUpdate = true;
				})
			},

		};

		this.material = new THREE.ShaderMaterial({
			uniforms: this.uniforms,
			vertexShader: vertex,
			fragmentShader: fragment,
			glslVersion: THREE.GLSL3,
			depthWrite: false,
			depthTest: false,
			blending: THREE.CustomBlending,
		});

		this.geometry = new THREE.PlaneGeometry(2, 2);
		this.mesh = new THREE.Mesh(this.geometry, this.material);
		this.scene.add(this.mesh);
	}
	animate() {

		// const randomValue = (Math.random() * 5 + 1.0).toFixed(1);
		// const randomVal = (Math.random() * 5 + 1.0).toFixed(1);
		// const randomVa = (Math.random() * 1 + 0.1).toFixed(1);

		// gsap.to(this.uniforms.col1, {
		// 	value: randomValue,
		// 	duration: 1.4,
		// 	ease: "power4.inOut"
		// });

		this.canvas.addEventListener('mousemove', (e) => {
			const rect = this.canvas.getBoundingClientRect();

			const mouseX = ((e.clientX - rect.left) / this.canvas.clientWidth) * 2 - 1;
			const mouseY = 1 - ((e.clientY - rect.top) / this.canvas.clientHeight) * 2;

			this.material.uniforms.mouse.value = [mouseX, mouseY];
		});

	}

	render() {

		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.material.uniforms.time.value = this.clock.getElapsedTime();
		this.material.uniforms.u_lightness.value = this.PARAMS.lightness;

		this.material.uniforms.u_colr.value = this.PARAMS.colr;
		this.material.uniforms.u_colg.value = this.PARAMS.colg;
		this.material.uniforms.u_colb.value = this.PARAMS.colb;

		this.material.uniforms.MOUSE_STRENGTH.value = this.PARAMS.MOUSE_STRENGTH;
		this.material.uniforms.MOUSE_SIZE.value = this.PARAMS.MOUSE_SIZE;
		this.material.uniforms.SCALE.value = this.PARAMS.SCALE;
		this.material.uniforms.DUST_OPACITY.value = this.PARAMS.DUST_OPACITY;

		this.renderer.render(this.scene, this.camera);
		requestAnimationFrame(this.render.bind(this));
	}

	resize() {
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.camera.aspect = window.innerWidth / window.innerHeight;

		this.camera.updateProjectionMatrix();
		this.renderer.render(this.scene, this.camera);
	}

	setUpResize() {
		window.addEventListener("resize", this.resize.bind(this));
	}
}

new Fabric();
