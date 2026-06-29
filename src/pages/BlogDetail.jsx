// src/pages/BlogDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function BlogDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .single();

      if (!error) setPost(data);
      setLoading(false);
    };
    fetchPost();
  }, [slug]);

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem' }}>⏳ Chargement...</div>;
  if (!post) return <div style={{ textAlign: 'center', padding: '3rem' }}>❌ Article introuvable</div>;

  return (
    <article style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
      <Link to="/blog" style={{ display: 'inline-block', marginBottom: '1.5rem', color: '#0A4D8C', fontWeight: 'bold' }}>
        ← Retour aux articles
      </Link>
      <h1 style={{ color: '#0A4D8C' }}>{post.title}</h1>
      <p style={{ color: '#6c757d', fontSize: '0.9rem' }}>
        Publié le {post.published_at ? new Date(post.published_at).toLocaleDateString('fr-FR') : 'Date inconnue'}
        {post.author && ` par ${post.author}`}
      </p>

      {post.featured_image ? (
        <img
          src={post.featured_image}
          alt={post.title}
          style={{
            width: '100%',
            maxHeight: '400px',
            objectFit: 'cover',
            borderRadius: '12px',
            margin: '1.5rem 0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        />
      ) : (
        <div style={{
          width: '100%',
          height: '200px',
          background: '#e9ecef',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '12px',
          margin: '1.5rem 0',
          color: '#6c757d',
        }}>
          📷 Image non disponible
        </div>
      )}

      <div style={{ lineHeight: '1.8', fontSize: '1.05rem' }}>
        {post.content ? (
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        ) : (
          <p>Aucun contenu.</p>
        )}
      </div>
    </article>
  );
}

export default BlogDetail;