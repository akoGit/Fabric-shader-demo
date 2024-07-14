// The MIT License
// Copyright © 2024 Giorgi Azmaipharashvili
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

in vec2 vUv;

uniform float time;
uniform vec2 mouse;
uniform sampler2D tex1;
uniform sampler2D tex2;
uniform float u_lightness;
uniform float u_color;

uniform float u_colr;
uniform float u_colg;
uniform float u_colb;
uniform float MOUSE_STRENGTH;
uniform float MOUSE_SIZE;
uniform float SCALE;
uniform float DUST_OPACITY;

out vec4 color;

#define INVERT 1

float noise(vec2 p) {
    return smoothstep(-0.5, 0.9, sin((p.x - p.y) * 555.0) * sin(p.y * 1444.0)) - 0.4;
}

float fabric(vec2 p) {
    const mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
    float f = 0.4 * noise(p);
    f += 0.3 * noise(p = m * p);
    f += 0.2 * noise(p = m * p);
    return f + 0.1 * noise(m * p);
}

float silk(vec2 uv, vec2 f, float t) {
    float s = sin(5.0 * (uv.x + uv.y + cos(2.0 * uv.x + 5.0 * uv.y)) + sin(12.0 * (uv.x + uv.y)) - t);
    s = 0.7 + 0.3 * (s * s * 0.5 + s);
    // s *= 0.9 + 0.6 * fabric(uv / (max(f.x, f.y) * 1666.0 * SCALE));
    return s * 0.9 + 0.1;
}

float silkd(vec2 uv, float t) {
    float xy = uv.x + uv.y;
    float d = (5.0 * (1.0 - 2.0 * sin(2.0 * uv.x + 5.0 * uv.y)) + 12.0 * cos(12.0 * xy)) * cos(5.0 * (cos(2.0 * uv.x + 5.0 * uv.y) + xy) + sin(12.0 * xy) - t);
    return 0.005 * d * (sign(d) + 3.0);
}

void main() {
    vec2 f = fwidth(vUv);
    vec2 uv = gl_FragCoord.xy * max(f.x, f.y) * SCALE;

    float t = time;
    uv.y += 0.03 * sin(8.0 * uv.x - t);

    vec2 nv = gl_FragCoord.xy * f * 2.0 - 1.0;
    uv += (smoothstep(MOUSE_SIZE, 0.0, distance(mouse, nv)) * 2.0 - 1.0) * 0.02 * MOUSE_STRENGTH;

    float s = sqrt(silk(uv, f, t));
    float d = silkd(uv, t);

    uv += s * s * 0.05;
    #if INVERT
    vec3 c = vec3(s) * u_lightness; // lightness ??
    // vec3 c = vec3(s) * (1.2 * pow(texture(tex1, vec2(vUv.x, uv.y)).rgb, vec3(1.0 * vec3(0.52, 0.5, 0.5) / 0.3))); // Blue
    #else
    vec3 c = vec3(s) * pow(texture(tex1, vec2(vUv.x, uv.y)).rgb, vec3(2.2));
    #endif
    c += 0.7 * vec3(1, 0.83, 0.6) * d;
    c *= 1.0 - max(0.0, 0.8 * d);
    c = clamp(c, 0.0, 1.0);
    #if INVERT
    c = pow(c, 0.3 / vec3(u_colr, u_colg, u_colb));
    c = 1.0 - c;
    c += (1.0 - s * s) * 1.0 * texture(tex2, vec2(vUv.x, uv.y)).rgb;
    #else
    c = pow(c, vec3(0.52, 0.5, 0.4));
    c += (1.0 - s * s) * DUST_OPACITY * texture(tex2, vec2(vUv.x, uv.y)).rgb;
    #endif
    color = vec4(c, 1);
}
