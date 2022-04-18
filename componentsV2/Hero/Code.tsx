import React from 'react';

const Code = () => {
  return (
    <>
      <span className="var-highlight">const</span> userInfo = &#123; &#10;&#13; name:
      <span className="string-highlight">&#39;Oğuzhan&#39;</span>, &#10;&#13; surname:
      <span className="string-highlight">&#39;Olguncu&#39;</span>, &#10;&#13; location:
      <span className="string-highlight">&#39;Istanbul/Turkey&#39;</span>,
      &#10;&#13;&#32;technologies:[
      <span className="string-highlight">
        &#10;&#13;&#32;&#32;&#32;&#32;&#32;&#32;&#39;Javascript&#39;
      </span>
      ,
      <span className="string-highlight">
        &#10;&#13;&#32;&#32;&#32;&#32;&#32;&#32;&#39;Typescript&#39;
      </span>
      ,
      <span className="string-highlight">
        &#10;&#13;&#32;&#32;&#32;&#32;&#32;&#32;&#39;React&#39;
      </span>
      ];&#125;
    </>
  );
};

export default Code;
