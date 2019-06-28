
const fileInputElement = document.createElement('input');
fileInputElement.id = 'file-input';
fileInputElement.type = 'file';
fileInputElement.accept = 'image/*';

const textElement = document.createElement('span');
const element = document.createElement('div');
element.id = 'bottom-text';
element.appendChild(fileInputElement);
element.appendChild(textElement);
document.body.appendChild(element);


let onInputChange: (fileList: FileList) => void;


export function setText(text: string) {
    textElement.textContent = text;
}


export function showFileInput(onInputChange_?: (fileList: FileList) => void) {
    onInputChange = onInputChange_;
    element.classList.add('show-file-input');
}


export function hideFileInput() {
    onInputChange = null;
    element.classList.remove('show-file-input');
}


fileInputElement.addEventListener('change', (e) => {
    // e.target.files : FileList
    onInputChange && onInputChange((e.target as any).files);
}, false);
