import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GetStaticPaths, GetStaticProps } from 'next';
import Header from '../../components/Header';
import { FiCalendar, FiUser, FiClock  } from 'react-icons/fi';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { RichText } from 'prismic-dom';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  return(
    <>
      <head>
        <title>{post.data.title} | SpaceTraveling</title>
      </head>
      <Header/>

      <article className={styles.container}>
        <img src={post.data.banner.url} alt="banner post" />

        <div className={styles.containerPost}>
          <h1>Criando um app CRA do zero</h1>
          <div className={styles.informationPost}>
            <time> 
              <FiCalendar size={20} />
              15 Mar 2021
            </time>
            <span> 
              <FiUser size={20}/>
              15 Mar 2021
            </span>
            <span> 
              <FiClock size={20} />
              03 min
              </span>
          </div>

          <div className={styles.content}>
           {post.data.content.map(content => (
             <div key={content.heading} >
               <h2>{ content.heading }</h2>
               <div className={styles.contentBody}>
                 <p>{RichText.asText(content.body)}</p>
               </div>
             </div>
           ))}
          </div>
        </div>
      </article>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('post');

  const paths = await posts.results.map((post) => ({
    params: { slug: post.uid }
  }))

  return{
    paths,
    fallback: true,
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('post', String(params.slug));

  const post = {
    uid: response.uid,
    first_publication_date: format(
      new Date(response.first_publication_date),
      'PP',
      {
        locale: ptBR
      }
    ),
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url
      },
      author: response.data.author,
      content: response.data.content.map(contentText => {
        return {
          heading: contentText.heading,
          body: contentText.body
        }
      })
    }
  }

  return {
    props: {
      post
    }
  }
};
