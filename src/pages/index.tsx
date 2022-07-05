import { GetStaticProps } from 'next';
import  Head  from 'next/head';
import  Link  from 'next/link';
import { useState } from 'react';

import { getPrismicClient } from '../services/prismic';

import { FiCalendar, FiUser } from 'react-icons/fi';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR'

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState<Post[]>(postsPagination.results)

  console.log(posts)
  

  return(
    <>
      <Head>
        <title>Posts | SpaceTraveling</title>
      </Head>

      <header className={styles.header}>
        <img src="/images/logo.svg" alt="logo" />
      </header>

      <main className={styles.container}>
        <div className={styles.posts}>
          {posts.map(post => (
            <p>{post.data.title}</p>
          ))}
        </div>
      </main>

    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('posts', {pageSize: 1});

  const results = postsResponse.results.map(post => {
    return{
      uid: post.uid,
      first_publication_date: format(
        new Date(post.first_publication_date),
        'PP',
        {
          locale: ptBR
        }
      ),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    }
  })

  return{
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results
      }
    },
    revalidate: 60 * 60 * 12 // 12 hours
  }
};
