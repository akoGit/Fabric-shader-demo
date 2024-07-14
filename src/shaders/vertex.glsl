out vec2 vUv;
uniform vec3 uResolution;
uniform float time;

void main() {
    vUv = uv;

    gl_Position = vec4(position, 1);
}
