import React, { useState, useEffect } from "react";

interface GithubGist {
  loadingClass?: string;
  wrapperClass?: string;
  titleClass?: string;
  contentClass?: string;
  gist: string;
  file?: string;
}

const GithubGist: React.FC<GithubGist> = ({
  wrapperClass,
  titleClass,
  contentClass,
  gist,
  file
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState();
  const [title, setTitle] = useState<string>();
  const [content, setContent] = useState();

  useEffect(() => {
    const getGist = async () => {
      setLoading(true);

      const gistId = gist.split("/")[1];

      if (!gistId) {
        setLoading(false);
        setError(`${gist} is not valid format`);
        return;
      }

      window[`gist_callback_${gistId}`] = (gist: any) => {
        setLoading(false);
        setError(gist.error || null);

        if (!error) {
          setTitle(gist.description);
          setContent(`${gist.div.replace(/href=/g, 'target="_blank" href=')}`);
        }

        if (document.head.innerHTML.indexOf(gist.stylesheet) === -1) {
          let stylesheet = document.createElement("link");
          stylesheet.type = "text/css";
          stylesheet.rel = "stylesheet";
          stylesheet.href = gist.stylesheet;
          document.head.appendChild(stylesheet);
        }
      };

      const script = document.createElement("script");
      let url = `https://gist.github.com/${gist}.json?callback=gist_callback_${gistId}`;
      if (file) url += `&file=${file}`;
      script.type = "text/javascript";
      script.src = url;
      script.addEventListener("error", () => {
        setLoading(false);
        setError(`${gist} failed to load`);
      });
      document.head.appendChild(script);
    };

    if (gist) {
      getGist();
    }
  }, [gist, file]);

  if (loading) {
    return <div className="loadingClass">Loading</div>;
  }

  if (error) {
    return <div>Error</div>;
  }

  return (
    <article className={wrapperClass}>
      <h2 className={titleClass}>{title}</h2>
      <section
        className={contentClass}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </article>
  );
};

export default GithubGist;
