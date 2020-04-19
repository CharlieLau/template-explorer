const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`
const qnameCapture = `((?:${ncname}\\:)?${ncname})`
const startTagOpen = new RegExp(`^<${qnameCapture}`);
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`)
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
const startTagClose = /^\s*(\/?)>/;
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g


export function parse(html) {

    while (html) {
        const htmlEnd = html.indexOf('<');
        if (htmlEnd) {
            let startTagMatch = parseStartTag();
            console.log(startTagMatch)
            break;
        }
    }

    function advance(n) {
        html = html.substring(n)
    }


    function parseStartTag() {
        const start = html.match(startTagOpen)
        if(start){
            const match={
                tagName:start[1],
                attrs:[]
            }
            advance(start[0].length);
            const end,attr;

            while(!(end= html.match(startTagClose))&&(attr= html.match(attribute))){
                advance(attr[0].length)
                match.attrs.push({
                    name:attr[1],
                    value: attr[3] || attr[4] || attr[5]
                })
            }
            if(end){
                advance(end[0].length);
                return match
            }
        }

    }

}