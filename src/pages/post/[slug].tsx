import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GetStaticPaths, GetStaticProps } from 'next';
import Header from '../../components/Header';
import { FiCalendar, FiUser, FiClock  } from 'react-icons/fi';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { RichText } from 'prismic-dom';
import { useRouter } from 'next/router';

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
  const router = useRouter();

  if(router.isFallback){
    return <span>Carregando...</span>
  }

  const wordsRead = 200;
  const sumTotalWords = post.data.content.reduce(( sumTotal, itemText ) => {
    const totalWords = itemText.body.map(item => item.text.split(' ').length);

    totalWords.forEach(word => ( sumTotal += word ))
    return sumTotal;
  }, 0)

  const readByMinute = Math.ceil(sumTotalWords / wordsRead)

  return(
    <>
     
      <Header/>

      <article className={styles.container}>
        <img src={post.data.banner.url} alt="banner post" />

        <div className={styles.containerPost}>
          <h1>{post.data.title}</h1>
          <div className={styles.informationPost}>
            <time> 
              <FiCalendar size={20} />
              {format(
              new Date(post.first_publication_date),
              'PP',
              {
                locale: ptBR
              }
              )}
            </time>
            <span> 
              <FiUser size={20}/>
              {post.data.author}
            </span>
            <span> 
              <FiClock size={20} />
              {readByMinute} min
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
    first_publication_date: response.first_publication_date,
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
