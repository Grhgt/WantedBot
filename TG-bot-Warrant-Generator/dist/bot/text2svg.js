import TextToSVG from 'text-to-svg';
import { svgPathProperties } from 'svg-path-properties';
var Anchor;
(function (Anchor) {
    Anchor["Top"] = "top";
    Anchor["Middle"] = "middle";
    Anchor["Bottom"] = "bottom";
})(Anchor || (Anchor = {}));
export const Text2SVG = (fill, fontname, fontsize, text) => {
    const attributes = { fill: fill, stroke: fill };
    const options = { x: 0, y: 0, fontSize: fontsize, anchor: Anchor.Top, attributes: attributes };
    const textToSVG = TextToSVG.loadSync('fonts/' + fontname);
    const svgString = textToSVG.getSVG(text, options);
    const startIndex = svgString.indexOf('><path');
    const endIndex = svgString.indexOf('/></svg>') + '/>'.length;
    console.log("svg string ===> ", svgString);
    if (startIndex === -1 || endIndex === -1) {
        return '';
    }
    const pathString = svgString.substring(startIndex + 1, endIndex);
    return pathString;
};
export const GetPathLength = (path) => {
    const startIndex = path.indexOf('d="');
    const endIndex = path.indexOf('Z"/>');
    const pathData = path.substring(startIndex + 3, endIndex + 1);
    const properties = new svgPathProperties(pathData);
    const length = properties.getTotalLength();
    return length / 4;
};
//# sourceMappingURL=text2svg.js.map