import { useEffect } from 'react';

const useTypewritting = (typeRef: any) => {
  useEffect(() => {
    function setupTypewriter() {
      if (!typeRef.current) return;

      const HTML = typeRef.current.innerHTML;

      typeRef.current.innerHTML = '';

      const typeInfo = {
        cursorPosition: 0,
        tag: '',
        writingTag: false,
        tagOpen: false,
        typeSpeed: 50,
        tempTypeSpeed: 0,
      };
      const type = function () {
        if (typeInfo.writingTag) typeInfo.tag += HTML[typeInfo.cursorPosition];

        if (HTML[typeInfo.cursorPosition] === '<') {
          typeInfo.tempTypeSpeed = 0;
          if (typeInfo.tagOpen) {
            typeInfo.tagOpen = false;
            typeInfo.writingTag = true;
          } else {
            typeInfo.tag = '';
            typeInfo.tagOpen = true;
            typeInfo.writingTag = true;
            typeInfo.tag += HTML[typeInfo.cursorPosition];
          }
        }
        if (!typeInfo.writingTag && typeInfo.tagOpen) {
          (typeInfo.tag as any).innerHTML += HTML[typeInfo.cursorPosition];
        }

        if (!typeInfo.writingTag && !typeInfo.tagOpen) {
          if (HTML[typeInfo.cursorPosition] === '') {
            typeInfo.tempTypeSpeed = 0;
          } else {
            typeInfo.tempTypeSpeed = Math.random() * typeInfo.typeSpeed + 25;
          }
          if (typeRef.current) {
            typeRef.current.innerHTML += HTML[typeInfo.cursorPosition];
          }
        }

        if (typeInfo.writingTag === true && HTML[typeInfo.cursorPosition] === '>') {
          typeInfo.tempTypeSpeed = Math.random() * typeInfo.typeSpeed + 25;
          typeInfo.writingTag = false;
          if (typeInfo.tagOpen) {
            const newSpan = document.createElement('span');
            if (typeRef.current) {
              typeRef.current.appendChild(newSpan);
            }
            newSpan.innerHTML = typeInfo.tag;
            (typeInfo as any).tag = newSpan.firstChild;
          }
        }

        typeInfo.cursorPosition += 1;
        if (typeInfo.cursorPosition < HTML.length - 1) {
          setTimeout(type, typeInfo.tempTypeSpeed);
        }
      };

      return {
        type,
      };
    }

    const typewriter = setupTypewriter();

    typewriter?.type();
  }, [typeRef]);
};

export default useTypewritting;
