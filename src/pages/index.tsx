import { GetStaticProps } from "next";
import { usePlayer } from "../contexts/PlayerContext";
import Image from "next/image";
import Head from "next/head";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";
import { api } from "../services/api";
import { ConvertDurationToTimeString } from "../utils/convertDurationToTimeString";

import styles from "./home.module.scss";

interface Episode {
  id: string;
  title: string;
  members: string;
  publishedAt: string;
  thumbnail: string;
  duration: number;
  durationAsString: string;
  url: string;
}
interface HomeProps {
  lastestEpisodes: Episode[];
  allEpisodes: Episode[];
}

export default function Home({ lastestEpisodes, allEpisodes }: HomeProps) {
  const { playList } = usePlayer();

  const episodeList = [...lastestEpisodes, ...allEpisodes];

  return (
    <div className={styles.homePage}>
      <Head>
        <title>Home | Podcastr</title>
      </Head>
      <section className={styles.lastestEpisodes}>
        <h2>Últimos lançamentos</h2>
        <ul>
          {lastestEpisodes.map((episode, index) => {
            return (
              <li key={episode.id}>
                <Image width={192} height={192} src={episode.thumbnail} alt={episode.title} objectFit="cover" />

                <div className={styles.episodesDetails}>
                  <Link href={`/episodes/${episode.id}`}>
                    <a>{episode.title}</a>
                  </Link>
                  <p>{episode.members}</p>
                  <span>{episode.publishedAt}</span>
                  <span>{episode.durationAsString}</span>
                </div>

                <button type="button" onClick={() => playList(episodeList, index)}>
                  <img src="/play-green.svg" alt="Tocar episódio" />
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className={styles.allEpisodes}>
        <h2>Tod os episódios</h2>

        <table cellSpacing={0}>
          <thead>
            <th></th>
            <th>Podcast</th>
            <th>Integrantes</th>
            <th>Data</th>
            <th>Duração</th>
            <th></th>
          </thead>

          <tbody>
            {allEpisodes.map((episode, index) => {
              return (
                <tr key={episode.id}>
                  <td style={{ width: 72 }}>
                    <Image width={120} height={120} src={episode.thumbnail} alt={episode.title} objectFit="cover" />
                  </td>

                  <td>
                    <Link href={`/episodes/${episode.id}`}>
                      <a>{episode.title}</a>
                    </Link>
                  </td>

                  <td>{episode.members}</td>
                  <td style={{ width: 200 }}>{episode.publishedAt}</td>
                  <td>{episode.durationAsString}</td>

                  <td>
                    <button type="button" onClick={() => playList(episodeList, index + lastestEpisodes.length)}>
                      <img src="/play-green.svg" alt="Tocar episódio" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const { data } = await api.get("episodes", {
    params: {
      _limit: 12,
      _sort: "published_at",
      _order: "desc",
    },
  });

  const episodes = data.map((episode) => {
    return {
      id: episode.id,
      title: episode.title,
      thumbnail: episode.thumbnail,
      members: episode.members,
      publishedAt: format(parseISO(episode.published_at), "d MMM yy", {
        locale: ptBR,
      }),
      duration: Number(episode.file.duration),
      durationAsString: ConvertDurationToTimeString(Number(episode.file.duration)),
      url: episode.file.url,
    };
  });

  const lastestEpisodes = episodes.slice(0, 2);
  const allEpisodes = episodes.slice(2, episodes.length);

  return {
    props: {
      lastestEpisodes,
      allEpisodes,
    },
    revalidate: 60 * 60 * 8,
  };
};
