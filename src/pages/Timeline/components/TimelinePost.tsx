import { SetStateAction, useContext, useEffect, useState } from 'react'
import {
    API_POSTS_URL,
    Comment,
    Contact,
    Post,
    PostContext,
} from '../../../App'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function TimelinePost(props: { post: Post }) {
    const [author, setAuthor] = useState<Contact>(defaultContact)
    const { contacts } = useContext(PostContext)

    useEffect(() => {
        for (const contact of contacts) {
            if (contact.id === props.post.contactId) {
                setAuthor(contact)
            }
        }
    }, [contacts, props.post.contactId])

    return (
        <div className='card bg-base-200 min-w-full p-4'>
            <Link
                to={`/profile/${author.id}`}
                className='card-title link-hover flex gap-4 pl-8 pt-8'
            >
                <img
                    src={author.profileImage ?? defaultContact.profileImage}
                    alt={`${author.firstName}'s profile photo`}
                    className='h-8 rounded-full'
                />
                <h1>
                    {author.firstName} {author.lastName}
                </h1>
            </Link>
            <div className='card-body gap-6'>
                <div className='flex flex-col gap-2'>
                    <span className='card-title'>{props.post.title}</span>
                    <span>{props.post.content}</span>
                </div>
                <Comments post={props.post} />
            </div>
        </div>
    )
}

function Comments(props: { post: Post }) {
    const [commentContent, setCommentContent] = useState<string>('')
    const { post } = props
    if (!post.comments)
        return (
            <div className='flex flex-col gap-4'>
                <p>No comments</p>
                <AddComment
                    post={post}
                    content={commentContent}
                    setContent={setCommentContent}
                />
            </div>
        )

    return (
        <div className='flex flex-col gap-4'>
            {post.comments.map((comment) => (
                <CommentsItem key={comment.id} comment={comment} />
            ))}
            <AddComment
                post={post}
                content={commentContent}
                setContent={setCommentContent}
            />
        </div>
    )
}

function CommentsItem(props: { comment: Comment }) {
    const [commentAuthor, setCommentAuthor] = useState<Contact>(defaultContact)
    const { comment } = props
    const { contacts } = useContext(PostContext)

    useEffect(() => {
        for (const contact of contacts) {
            if (contact.id === comment.contactId) {
                setCommentAuthor(contact)
            }
        }
    }, [contacts, comment.contactId])

    return (
        <li key={comment.id}>
            {`${commentAuthor.firstName} ${commentAuthor.lastName}`} {'->'}{' '}
            {comment.content}
        </li>
    )
}

function AddComment(props: {
    post: Post
    content: string
    setContent: React.Dispatch<SetStateAction<string>>
}) {
    const { post, content, setContent } = props
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const newComment: Comment = {
            id: Date.now(),
            contactId: post.contactId,
            content: content,
        }

        let updatedComments: [...Comment[], Comment]

        if (post.comments) {
            updatedComments = [...post.comments, newComment]
        } else {
            updatedComments = [newComment]
        }

        try {
            await axios.put(`${API_POSTS_URL}/${post.id}`, {
                ...post,
                comments: updatedComments,
            })
            setContent('')
            navigate('/')
        } catch (error) {
            console.error('Error updating the post with new comment:', error)
        }
    }

    return (
        <form className='flex gap-4' onSubmit={(e) => handleSubmit(e)}>
            <input
                type='text'
                className='input w-full'
                value={content}
                onChange={(e) => setContent(e.target.value)}
            />
            <input
                type='submit'
                className='btn bg-base-300'
                value={'Comment'}
            />
        </form>
    )
}

const defaultContact = {
    id: 0,
    firstName: 'John',
    lastName: 'Doe',
    street: '405 Baker Street',
    city: 'Manchester, NH',
    profileImage:
        'https://www.gravatar.com/avatar/Danyka8@yahoo.com?s=120&d=identicon',
}
